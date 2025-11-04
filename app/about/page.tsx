import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div 
        className="relative py-24 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/about-background.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-lg">
              About Parwell Farms
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-12 bg-farm-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <p className="text-gray-700 mb-4 leading-relaxed">
              We get a lot of questions of &quot;what&apos;s up with the rabbit thing?&quot; or &quot;Parwell? That&apos;s not your last name.&quot; So here&apos;s the story...My maiden name is Harwell and my family originated from Harwell, England. Our family crest has 3 hares on it. My married name is Parsons. I asked my husband when we were first married what their family crest was and he had no idea. We couldn&apos;t find one either! So I told him it should be a bee skep because every Parsons I knew in his family were industrious and hard workers, like a bee.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              With the blend of both names and family crests we created Parwell Farms. We live on 6.5 acres in the beautiful little hamlet of Vader Washington (formerly known as Little Falls). We are Lavender Farmers, Beekeepers, Soap Makers, Event Planners and Wood-turners! (among other things!)
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-farm-green mb-4">
              Victoria
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              I have a background in clothing retail and specialize in design and merchandising. I have a passion and desire to make all things feel and look beautiful, inside and outside of the home. I have always been told that I can make a silk purse out of a sow&apos;s ear. When customers come to our pop up shop I want them to walk in and have that &apos;Calgon take me away&apos; feeling. Upon leaving I want them to feel like they have been given a gift. Whether it just be from being enlightened about our products we make and sell or from the beautiful shopping bags we put their purchases in! (no ugly plastic bags here!)
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-farm-green mb-4">
              Mike
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Mike is 6&apos;3&quot; and 300#&apos;s give or take... contrary to popular belief he&apos;s a softy, he just looks burly. If anyone has ever seen him around our grandchildren you can see his burly turn to butter. He is truly that Jack of all trades kinda guy. He can do anything when he puts his mind to it. He has a background in the medical field, entertainment industry and construction. He is best known however as the &apos;Entrepreneur&apos;. He has taken his entertainment skills and created Black Tie LLC. His hobbies are wood turning and working on classic cars. You can find a lot of those hobbies in our shop...Custom farmhouse tables, Candle sticks, shelving and of course Penelope our &apos;51 chevy. Mike is always by my side (or maybe I should say I&apos;m by his) in our Parwell Farms endeavours.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-farm-green mb-4">
              Favorite Quotes
            </h2>
            <blockquote className="border-l-4 border-lavender-400 pl-6 italic text-gray-700 mb-4">
              <p className="mb-2">&quot;In the Spring at the end of the day you should smell like dirt.&quot;</p>
              <p>&quot;To the world you may be one person, but to one person you may be the world.&quot;</p>
            </blockquote>
            <p className="text-gray-700 text-right font-serif">
              — Victoria
            </p>
          </section>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

