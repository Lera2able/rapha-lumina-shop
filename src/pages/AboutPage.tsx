import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Heart, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PageMeta from '@/components/common/PageMeta';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <PageMeta
        title="Our Story | Rapha Lumina"
        description="Learn the story behind Rapha Lumina, our purpose-led approach to conscious apparel, and the values that shape our collections."
        canonicalPath="/about"
        ogImage="https://raphalumina.com/og-home.svg"
        ogImageAlt="Rapha Lumina brand story social preview card"
      />
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text text-balance">
              Our Story
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-pretty">
              A journey of awakening, purpose, and conscious creation
            </p>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-12">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-6 text-balance">The Birth of Rapha Lumina</h2>
                <div className="space-y-4 text-muted-foreground text-pretty">
                  <p className="text-lg leading-relaxed">
                    Rapha Lumina was born from a deep calling to bridge the spiritual and the physical, to create something that honors both the awakened soul and the practical needs of everyday life.
                  </p>
                  <p className="text-lg leading-relaxed">
                    In a world that often feels disconnected from higher purpose, we saw an opportunity to create apparel and tools that serve as daily reminders of our true nature—beings of light walking a path of conscious evolution.
                  </p>
                  <p className="text-lg leading-relaxed">
                    The name "Rapha Lumina" itself carries deep meaning: <strong className="text-foreground">Rapha</strong>, meaning healing and restoration, combined with <strong className="text-foreground">Lumina</strong>, representing light and illumination. Together, they embody our mission: to heal through light, to illuminate through purpose.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mission & Values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Our Mission</h3>
                  </div>
                  <p className="text-muted-foreground text-pretty">
                    To create spiritually inspired apparel and tools that empower conscious souls to wear their purpose, embody their light, and walk their path with intention and grace.
                  </p>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Our Vision</h3>
                  </div>
                  <p className="text-muted-foreground text-pretty">
                    A world where spiritual awakening and everyday living merge seamlessly, where what we wear and use reflects our highest values and deepest truths.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Core Values */}
            <Card className="mb-12">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-8 text-center">Our Core Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      Conscious Creation
                    </h3>
                    <p className="text-muted-foreground text-pretty">
                      Every product is designed with intention, created with care, and infused with the energy of purpose and awakening.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Authentic Expression
                    </h3>
                    <p className="text-muted-foreground text-pretty">
                      We believe in honoring your unique spiritual journey and providing tools that support your authentic self-expression.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Community Connection
                    </h3>
                    <p className="text-muted-foreground text-pretty">
                      We're building a community of awakened souls who support, inspire, and uplift one another on this journey.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Purpose-Driven
                    </h3>
                    <p className="text-muted-foreground text-pretty">
                      Everything we create serves a higher purpose—to remind you of your light, your power, and your infinite potential.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Collections Philosophy */}
            <Card className="mb-12">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-6 text-balance">Our Collections</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">The Enlightened Collection</h3>
                    <p className="text-muted-foreground text-pretty">
                      Designed for the spiritually awakened soul, this collection features apparel and accessories that celebrate higher consciousness, sacred geometry, and the journey of enlightenment. Each piece is a wearable reminder of your divine nature.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-primary">The Teacher Collection</h3>
                    <p className="text-muted-foreground text-pretty">
                      Created specifically for educators who understand that teaching is a sacred calling. This collection combines practical classroom tools with spiritually inspired designs, honoring those who shape young minds and hearts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* The Journey Continues */}
            <Card className="mb-12 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl font-bold mb-6 text-balance">The Journey Continues</h2>
                <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
                  Rapha Lumina is more than a brand—it's a movement. A gathering of conscious souls who choose to live with intention, wear their purpose, and embody their light. We're honored to be part of your journey.
                </p>
                <p className="text-xl font-semibold mb-8 gradient-text">
                  Welcome home, awakened soul.
                </p>
                <Link to="/enlightened">
                  <Button size="lg" className="px-8">
                    Explore Our Collections
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Contact CTA */}
            <div className="text-center p-8 bg-muted/30 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Connect With Us</h2>
              <p className="text-muted-foreground mb-6 text-pretty">
                Have questions or want to share your story? We'd love to hear from you.
              </p>
              <a href="mailto:support@raphalumina.com">
                <Button variant="outline" size="lg">
                  Get in Touch
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
