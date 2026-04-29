/**
 * Process product description HTML to convert product links to working Next.js links
 */

// Create a map of product names to IDs for fast lookup
export function createProductNameMap(items: Array<{ id: string; itemData?: { name?: string } }>): Map<string, string> {
  const nameMap = new Map<string, string>();
  
  items.forEach(item => {
    if (item.itemData?.name) {
      const name = item.itemData.name.trim();
      // Store exact match
      nameMap.set(name.toLowerCase(), item.id);
      // Also store variations for better matching
      // Remove common prefixes/suffixes and store
      const normalizedName = name
        .toLowerCase()
        .replace(/^(the|a|an)\s+/i, '') // Remove articles
        .trim();
      if (normalizedName !== name.toLowerCase()) {
        nameMap.set(normalizedName, item.id);
      }
    }
  });
  
  return nameMap;
}

/**
 * Find product ID by matching link text or href to product names
 * @param exactMatch - If true, only do exact matches (case-insensitive). If false, allow partial matches.
 */
function findProductId(
  linkText: string, 
  href: string | null, 
  nameMap: Map<string, string>,
  exactMatch: boolean = false
): string | null {
  // Try exact match first
  const normalizedText = linkText.trim().toLowerCase();
  if (nameMap.has(normalizedText)) {
    return nameMap.get(normalizedText)!;
  }
  
  // If exact match only, return null if not found
  if (exactMatch) {
    return null;
  }
  
  // Try partial matches (for cases where link text is abbreviated)
  for (const [name, id] of nameMap.entries()) {
    if (normalizedText.includes(name) || name.includes(normalizedText)) {
      return id;
    }
  }
  
  // If href contains product info, try to extract product name from it
  if (href) {
    // Check if href contains a product name or ID
    // Square might have URLs like /product/product-name or similar
    const urlParts = href.split('/').filter(Boolean);
    const lastPart = urlParts[urlParts.length - 1];
    
    // Try matching the last part of the URL
    if (lastPart) {
      const decodedPart = decodeURIComponent(lastPart).toLowerCase();
      if (nameMap.has(decodedPart)) {
        return nameMap.get(decodedPart)!;
      }
      
      // Try partial match on URL part
      for (const [name, id] of nameMap.entries()) {
        if (decodedPart.includes(name) || name.includes(decodedPart)) {
          return id;
        }
      }
    }
  }
  
  return null;
}

/**
 * Process description HTML to convert product links to working Next.js links
 */
export function processProductLinks(
  html: string, 
  nameMap: Map<string, string>
): string {
  if (!html) return html;
  
  // First, process existing <a> tags - handle both self-closing and regular tags
  let processed = html.replace(/<a\s+([^>]*?)>(.*?)<\/a>/gi, (match, attributes, linkText) => {
    // Extract href if present
    const hrefMatch = attributes.match(/href=["']([^"']*)["']/i);
    const href = hrefMatch ? hrefMatch[1] : null;
    
    // Clean link text (remove HTML tags within it)
    const cleanText = linkText.replace(/<[^>]*>/g, '').trim();
    
    // Try to find matching product
    const productId = findProductId(cleanText, href, nameMap);
    
    if (productId) {
      // Replace with working Next.js link, preserving original link text
      return `<a href="/products/${productId}" class="text-lavender-600 hover:text-lavender-700 underline">${linkText}</a>`;
    }
    
    // If href points to an external product URL or Square URL, try to extract product info
    if (href) {
      // Check if it's a Square product URL or old site URL
      // Square might use patterns like /product/product-name or /products/product-name
      const squareProductMatch = href.match(/\/(?:product|products)\/([^\/?#]+)/i);
      if (squareProductMatch) {
        const urlProductName = decodeURIComponent(squareProductMatch[1])
          .replace(/[-_]/g, ' ')
          .toLowerCase();
        const productId = findProductId(urlProductName, null, nameMap);
        if (productId) {
          return `<a href="/products/${productId}" class="text-lavender-600 hover:text-lavender-700 underline">${linkText}</a>`;
        }
      }
      
      // If it's a relative path that might be a product link
      if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#') && !href.startsWith('/products/')) {
        // Try matching the path itself
        const pathParts = href.split('/').filter(Boolean);
        if (pathParts.length > 0) {
          const lastPart = decodeURIComponent(pathParts[pathParts.length - 1]).toLowerCase();
          const productId = findProductId(lastPart, null, nameMap);
          if (productId) {
            return `<a href="/products/${productId}" class="text-lavender-600 hover:text-lavender-700 underline">${linkText}</a>`;
          }
        }
      }
    }
    
    return match; // Keep original link if we can't match it
  });
  
  // Also try to find product names in plain text that might need linking
  // This is more complex and might create false positives, so we'll be conservative
  // Only process if there's a clear pattern like "goes well with [Product Name]"
  const contextPatterns = [
    // Match phrases like "PAIRS WELL WITH: Product1, Product2" (case-insensitive)
    /(?:goes\s+well\s+with|pairs\s+well\s+with|try\s+with|also\s+see|see\s+also|works\s+well\s+with|complements?)[\s:]*([^.!?<]+)/gi,
  ];
  
  for (const pattern of contextPatterns) {
    processed = processed.replace(pattern, (match, productsText) => {
      // Skip if this is already inside a link
      if (match.includes('<a ') || match.includes('</a>')) {
        return match;
      }
      
      // Split by comma to handle multiple products
      const productNames = productsText.split(',').map((name: string) => name.trim()).filter(Boolean);
      
      // Try to match each product name - only exact matches
      let updatedMatch = match;
      for (const productName of productNames) {
        // Skip if it's already a link
        if (productName.includes('<a ') || productName.includes('</a>')) {
          continue;
        }
        
        // Try to find matching product - exact match only (case-insensitive)
        const productId = findProductId(productName, null, nameMap, true);
        
        if (productId) {
          // Get the exact product name from the map (for proper casing)
          let exactProductName = productName;
          for (const [mapName, mapId] of nameMap.entries()) {
            if (mapId === productId && mapName.toLowerCase() === productName.toLowerCase()) {
              exactProductName = mapName; // Use the exact name from the map
              break;
            }
          }
          
          // Escape special regex characters in the product name
          const escapedName = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          
          // Create a regex that matches the exact product name with word boundaries
          // This ensures we only match the complete product name, not parts of it
          const productNameRegex = new RegExp(`\\b${escapedName}\\b`, 'i');
          
          // Replace only if it's an exact match (same length and word boundaries)
          updatedMatch = updatedMatch.replace(productNameRegex, (matchedText) => {
            // Verify it's exactly the product name (case-insensitive)
            if (matchedText.toLowerCase().trim() === productName.toLowerCase().trim()) {
              // Use the exact product name from the map for the link text
              return `<a href="/products/${productId}" class="text-lavender-600 hover:text-lavender-700 underline">${matchedText}</a>`;
            }
            return matchedText;
          });
        }
      }
      
      return updatedMatch;
    });
  }
  
  // Final pass: Find exact product name matches anywhere in the text (case-insensitive)
  // This catches product names that appear outside of specific context patterns
  // Sort by length (longest first) to avoid matching shorter names that are part of longer ones
  const sortedEntries = Array.from(nameMap.entries()).sort((a, b) => b[0].length - a[0].length);
  
  for (const [productNameLower, productId] of sortedEntries) {
    // Skip if this product name is already linked somewhere
    const linkCheck = new RegExp(`<a[^>]*href=["']/products/${productId}["']`, 'i');
    if (linkCheck.test(processed)) {
      continue; // Already linked, skip
    }
    
    // Escape special regex characters
    const escapedName = productNameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Match the exact product name with word boundaries, case-insensitive
    const productNameRegex = new RegExp(`\\b${escapedName}\\b`, 'gi');
    
    // Find all matches with their positions (process in reverse to avoid position shifts)
    const matches: Array<{ text: string; index: number }> = [];
    let match;
    while ((match = productNameRegex.exec(processed)) !== null) {
      matches.push({ text: match[0], index: match.index });
    }
    
    // Process matches in reverse order (right to left) so positions don't shift
    for (let i = matches.length - 1; i >= 0; i--) {
      const { text: matchedText, index } = matches[i];
      
      // Check if we're inside an existing link tag by looking at the text before the match
      const beforeMatch = processed.substring(0, index);
      const afterMatch = processed.substring(index + matchedText.length);
      
      // Find the last <a> tag and </a> tag before this position
      const lastOpenLink = beforeMatch.lastIndexOf('<a ');
      const lastCloseLink = beforeMatch.lastIndexOf('</a>');
      
      // If we're inside a link (open tag after last close tag), skip
      if (lastOpenLink > lastCloseLink) {
        continue;
      }
      
      // Also check if there's a closing </a> immediately after (we're in a link)
      if (afterMatch.trim().startsWith('</a>')) {
        continue;
      }
      
      // Verify it's an exact match (case-insensitive)
      if (matchedText.toLowerCase().trim() === productNameLower.trim()) {
        // Replace this match
        const before = processed.substring(0, index);
        const after = processed.substring(index + matchedText.length);
        processed = before + 
          `<a href="/products/${productId}" class="text-lavender-600 hover:text-lavender-700 underline">${matchedText}</a>` + 
          after;
      }
    }
  }
  
  return processed;
}

