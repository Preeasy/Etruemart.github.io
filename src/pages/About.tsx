import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  Users,
  Globe,
  Target,
  Award,
  Heart,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
} from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To make quality products accessible to everyone, everywhere. We bridge the gap between global suppliers and consumers worldwide.',
    },
    {
      icon: Heart,
      title: 'Our Vision',
      description: 'To become the most trusted cross-border e-commerce platform, known for quality products, reliable shipping, and exceptional service.',
    },
    {
      icon: Award,
      title: 'Our Values',
      description: 'Quality, transparency, and customer satisfaction are at the heart of everything we do. We never compromise on quality.',
    },
  ];

  const team = [
    {
      name: 'Alex Thompson',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
    },
    {
      name: 'Sarah Chen',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
    },
    {
      name: 'Michael Rodriguez',
      role: 'Logistics Director',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    },
    {
      name: 'Emily Watson',
      role: 'Customer Success Lead',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
    },
  ];

  const milestones = [
    { year: '2020', title: 'eTruemart Founded', desc: 'Started with a vision to revolutionize cross-border shopping' },
    { year: '2021', title: '100K Customers', desc: 'Reached our first milestone of 100,000 happy customers' },
    { year: '2022', title: 'Global Expansion', desc: 'Expanded shipping to 100+ countries worldwide' },
    { year: '2023', title: 'Affiliate Program Launch', desc: 'Launched our successful affiliate marketing program' },
    { year: '2024', title: '500K+ Community', desc: 'Growing community of over 500,000 shoppers and partners' },
    { year: '2025', title: 'AI Integration', desc: 'Introducing AI-powered recommendations and support' },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-accent-500/20 text-accent-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Package className="w-4 h-4" />
            About eTruemart
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your Global Shopping Destination
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We connect quality products with shoppers worldwide, making international shopping simple, reliable, and affordable.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Globe, value: '150+', label: 'Countries Served' },
            { icon: Users, value: '500K+', label: 'Happy Customers' },
            { icon: Package, value: '10K+', label: 'Products' },
            { icon: Star, value: '4.8/5', label: 'Customer Rating' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-primary-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <p className="text-gray-500">{stat.label}</p>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                eTruemart was founded in 2020 with a simple mission: to make quality products accessible to everyone,
                no matter where they live in the world.
              </p>
              <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                What started as a small team passionate about cross-border commerce has grown into a global platform serving
                hundreds of thousands of customers across 150+ countries.
              </p>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                We believe that great products should know no borders. Through our smart logistics network and partnerships
                with top global carriers, we bring the world's best products right to your doorstep.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="btn-primary">
                  Shop Now <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link to="/contact" className="btn-secondary">
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556740755-069a40165b40?w=800&h=600&fit=crop"
                alt="Our Team"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-accent-500 text-white p-6 rounded-xl shadow-lg">
                <div className="text-3xl font-bold">5+</div>
                <div className="text-sm">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What We Stand For</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our core values guide everything we do, from product selection to customer service.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl card-hover">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose eTruemart?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We're more than just an online store. We're your global shopping partner.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'Quality Guaranteed', desc: 'Every product is carefully selected and quality checked.' },
            { icon: Truck, title: 'Fast Global Shipping', desc: 'Reliable delivery to 150+ countries worldwide.' },
            { icon: Users, title: 'Affiliate Program', desc: 'Earn commissions by sharing products you love.' },
            { icon: CheckCircle, title: 'Secure Payments', desc: 'Multiple payment options with full protection.' },
            { icon: Heart, title: '24/7 Support', desc: 'Our team is always here to help you.' },
            { icon: Award, title: 'Best Prices', desc: 'Competitive prices with regular deals and offers.' },
          ].map((item, index) => (
            <div key={index} className="flex gap-4 bg-white p-6 rounded-xl shadow-sm card-hover">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            The passionate people behind eTruemart who make it all happen.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-4 overflow-hidden rounded-2xl">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                <p className="text-primary-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              From humble beginnings to a global platform.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-primary-200 hidden md:block" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className={`flex-1 ${index % 2 === 1 ? 'md:text-right' : ''}`}>
                    <div className="bg-white p-6 rounded-xl shadow-sm inline-block">
                      <span className="text-accent-600 font-bold text-lg">{milestone.year}</span>
                      <h3 className="font-bold text-gray-900 text-xl mt-1">{milestone.title}</h3>
                      <p className="text-gray-600 mt-2">{milestone.desc}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-accent-500 rounded-full border-4 border-white shadow z-10 hidden md:block" />
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-700 to-primary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-gray-200 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of thousands of happy customers and discover amazing products from around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="bg-accent-500 hover:bg-accent-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
              Explore Products
            </Link>
            <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-primary-800 px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
