import { NextResponse } from 'next/server';
import { getSquareClient, getSquareItems, getSquareCategories } from '@/lib/square';

function toSerializable(value: any): any {
  if (typeof value === 'bigint') return Number(value);
  if (Array.isArray(value)) return value.map(toSerializable);
  if (value && typeof value === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) out[k] = toSerializable(v);
    return out;
  }
  return value;
}

export async function GET() {
  try {
    const client = getSquareClient();
    if (!client) {
      return NextResponse.json({ error: 'Square client not initialized' }, { status: 503 });
    }

    const [items, categoryMap] = await Promise.all([
      getSquareItems(),
      getSquareCategories(),
    ]);

    // Build reverse map name -> id (case-insensitive; keep first seen)
    const nameToId: Record<string, string> = {};
    Object.entries(categoryMap).forEach(([id, name]) => {
      const key = (name || '').toLowerCase();
      if (key && !nameToId[key]) nameToId[key] = id;
    });

    const categories: Record<string, { id: string, count: number }> = {};
    items.forEach((item: any) => {
      (item.itemData?.categories || []).forEach((cat: any) => {
        const id = cat.id || '';
        if (!id) return;
        const name = categoryMap[id] || id;
        if (!categories[name]) categories[name] = { id, count: 0 };
        categories[name].count += 1;
      });
    });

    // Target category diagnostics
    const targetNames = [
      'wild heifers boutique',
      'wild heifer boutique',
      'wild heifers',
    ];
    const targetId = targetNames.map(n => nameToId[n]).find(Boolean);

    const targetItems = targetId
      ? items.filter((it: any) => (it.itemData?.categories || []).some((c: any) => c.id === targetId))
      : [];

    const detail = targetItems.slice(0, 25).map((it: any) => ({
      id: it.id,
      name: it.itemData?.name,
      isArchived: !!it.itemData?.isArchived,
      imageIdsCount: it.itemData?.imageIds?.length || 0,
      presentAtAllLocations: !!it.presentAtAllLocations,
      presentAtLocationIds: it.presentAtLocationIds || [],
      absentAtLocationIds: it.absentAtLocationIds || [],
      channels: it.channels || [],
      // Square occasionally has reportingCategory; include if present
      reportingCategory: it.itemData?.reportingCategory ? {
        id: it.itemData.reportingCategory.id,
        ordinal: it.itemData.reportingCategory.ordinal,
      } : null,
      // First variation props
      firstVariation: (() => {
        const v = (it.itemData?.variations || [])[0];
        if (!v) return null;
        return {
          id: v.id,
          name: v.itemVariationData?.name,
          sku: v.itemVariationData?.sku,
          priceMoney: v.itemVariationData?.priceMoney ? {
            amount: v.itemVariationData.priceMoney.amount,
            currency: v.itemVariationData.priceMoney.currency,
          } : null,
          trackInventory: v.itemVariationData?.trackInventory,
        };
      })(),
    }));

    return NextResponse.json(toSerializable({
      categoriesSummary: Object.entries(categories)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, { id, count }]) => ({ name, id, count })),
      target: {
        name: targetId ? Object.entries(categoryMap).find(([id]) => id === targetId)?.[1] : null,
        id: targetId || null,
        count: targetItems.length,
        items: detail,
      }
    }));
  } catch (error: any) {
    console.error('Error inspecting categories:', error);
    return NextResponse.json({ error: error.message || 'Failed to inspect categories' }, { status: 500 });
  }
}
