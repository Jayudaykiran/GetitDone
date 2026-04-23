import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Wrench, 
  Lightbulb, 
  Code, 
  Car, 
  Paintbrush, 
  Home,
  ArrowRight,
  CheckCircle,
  Users,
  Shield,
  Clock
} from 'lucide-react'
import Navbar from '../components/Navbar'

const categories = [
  { name: 'Plumbers', icon: Wrench, color: 'from-blue-500 to-blue-600' },
  { name: 'Electricians', icon: Lightbulb, color: 'from-yellow-500 to-orange-500' },
  { name: 'Developers', icon: Code, color: 'from-purple-500 to-pink-500' },
  { name: 'Drivers', icon: Car, color: 'from-green-500 to-emerald-600' },
  { name: 'Painters', icon: Paintbrush, color: 'from-red-500 to-rose-600' },
  { name: 'Home Services', icon: Home, color: 'from-indigo-500 to-blue-600' },
]

const features = [
  {
    icon: Users,
    title: 'Verified Professionals',
    description: 'All workers are thoroughly vetted and verified for your peace of mind.'
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Your data and transactions are protected with enterprise-grade security.'
  },
  {
    icon: Clock,
    title: 'Available 24/7',
    description: 'Book services anytime, anywhere. Professional help is just a click away.'
  },
  {
    icon: CheckCircle,
    title: 'Quality Guaranteed',
    description: 'All services come with quality assurance and customer support.'
  }
]

const stats = [
  { value: '10,000+', label: 'Active Professionals' },
  { value: '50,000+', label: 'Jobs Completed' },
  { value: '4.9/5', label: 'Average Rating' },
  { value: '24/7', label: 'Support Available' }
]

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1e293b] mb-6 text-shadow">
                Find the perfect professional,{' '}
                <span className="bg-gradient-to-r from-[#2563eb] to-purple-600 bg-clip-text text-transparent">
                  anytime.
                </span>
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl text-[#475569] mb-10 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Hire verified skilled professionals and everyday helpers instantly.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={itemVariants}
            >
              <Link to="/search" className="btn-primary flex items-center gap-2 group">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register" className="btn-secondary">
                Join as a Professional
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
              variants={itemVariants}
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#2563eb] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#475569]">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Gradient Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </section>

      {/* Categories Section */}
      <section className="section-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
              Popular Categories
            </h2>
            <p className="text-lg text-[#475569] max-w-2xl mx-auto">
              Explore our most requested services and find the perfect professional for your needs.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            variants={containerVariants}
          >
            {categories.map((category, idx) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  className="card-hover group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#1e293b]">{category.name}</h3>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          <motion.div className="text-center mt-10" variants={itemVariants}>
            <Link to="/search" className="btn-outline">
              View All Categories
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div className="text-center mb-12" variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">
                Why Choose GetItDone?
              </h2>
              <p className="text-lg text-[#475569] max-w-2xl mx-auto">
                We connect you with trusted professionals who deliver exceptional service every time.
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
            >
              {features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className="text-center"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                      <Icon className="w-8 h-8 text-[#2563eb]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#1e293b] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-[#475569]">
                      {feature.description}
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-primary py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of satisfied customers who trust GetItDone for their service needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/search" className="bg-white text-[#2563eb] hover:bg-gray-100 font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Find a Professional
              </Link>
              <Link to="/register" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-xl transition-all duration-300">
                Become a Professional
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e293b] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <span className="text-xl font-bold">GetItDone</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted platform for connecting with skilled professionals.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Clients</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/search" className="hover:text-white transition-colors">Find Workers</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">My Bookings</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Professionals</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Join as Worker</Link></li>
                <li><Link to="/dashboard-worker" className="hover:text-white transition-colors">Worker Dashboard</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 GetItDone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
