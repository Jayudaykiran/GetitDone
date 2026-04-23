import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import SearchBar from '../components/SearchBar'
import { searchWorkersAdvanced } from '../services/workerService'
import WorkerCard from '../components/WorkerCard'
import { Loader2, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SearchResults() {
  const { user } = useAuth()
  const [results, setResults] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false) // Changed to false - no initial load
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')

  // Removed useEffect - no initial load of all workers

  const doSearch = (payload: any) => {
    console.log('[SearchResults] ===== SEARCH TRIGGERED =====');
    console.log('[SearchResults] Search payload:', JSON.stringify(payload, null, 2));
    setLoading(true)
    setSearchPerformed(true)
    searchWorkersAdvanced(payload)
      .then(data => {
        console.log('[SearchResults] ===== SEARCH RESULTS RECEIVED =====');
        console.log('[SearchResults] Full response:', JSON.stringify(data, null, 2));
        console.log('[SearchResults] Count:', data.count);
        console.log('[SearchResults] Workers:', data.workers);
        console.log('[SearchResults] Workers length:', data.workers?.length || 0);
        
        if (data.workers && Array.isArray(data.workers)) {
          console.log('[SearchResults] Setting count to:', data.count || 0);
          console.log('[SearchResults] Setting results array with', data.workers.length, 'items');
          // Filter out the logged-in user from search results
          const filteredWorkers = data.workers.filter((w: any) => 
            w.user?.uniqueUserCode !== user?.uniqueUserCode
          );
          console.log('[SearchResults] Filtered workers (excluding self):', filteredWorkers.length);
          setCount(filteredWorkers.length);
          setResults(filteredWorkers);
        } else {
          console.error('[SearchResults] Workers is not an array!', typeof data.workers);
          setCount(0);
          setResults([]);
        }
      })
      .catch(err => {
        console.error('[SearchResults] ===== SEARCH ERROR =====');
        console.error('[SearchResults] Error:', err);
        setCount(0);
        setResults([]);
      })
      .finally(() => {
        console.log('[SearchResults] Search complete, setting loading to false');
        setLoading(false);
      })
  }

  // Sort results based on selected option
  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'experience') {
      return (b.yearsExperience || 0) - (a.yearsExperience || 0)
    } else if (sortBy === 'price-low') {
      return (a.rate || 0) - (b.rate || 0)
    } else if (sortBy === 'price-high') {
      return (b.rate || 0) - (a.rate || 0)
    }
    return 0 // relevance - default order
  })

  console.log('[SearchResults] ===== RENDER STATE =====');
  console.log('[SearchResults] count:', count);
  console.log('[SearchResults] results.length:', results.length);
  console.log('[SearchResults] sortedResults.length:', sortedResults.length);
  console.log('[SearchResults] loading:', loading);
  console.log('[SearchResults] searchPerformed:', searchPerformed);
  console.log('[SearchResults] sortBy:', sortBy);
  console.log('[SearchResults] Will render:', loading ? 'LOADING' : results.length === 0 ? 'NO RESULTS' : `${sortedResults.length} WORKER CARDS`);

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
      transition: { duration: 0.4 }
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Navbar />

      {/* Hero Section - Minimal */}
      <div className="gradient-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl md:text-2xl font-bold text-shadow">Find Workers</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search Bar */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SearchBar onSearch={doSearch} />
        </motion.div>

        {/* Results Section */}
        <div>
          <motion.div 
            className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b]">
              {loading ? 'Searching...' : searchPerformed ? `${count} ${count === 1 ? 'Worker' : 'Workers'} Found` : 'Search for Workers'}
            </h2>
            {!loading && results.length > 0 && searchPerformed && (
              <select 
                className="input-field w-full sm:w-auto text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Sort by: Relevance</option>
                <option value="experience">Sort by: Experience</option>
                <option value="price-low">Sort by: Price (Low to High)</option>
                <option value="price-high">Sort by: Price (High to Low)</option>
              </select>
            )}
          </motion.div>

          {loading ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2 className="animate-spin text-[#2563eb] mb-4" size={48} />
              <p className="text-[#475569] text-lg">Searching for workers...</p>
            </motion.div>
          ) : !searchPerformed ? (
            <motion.div 
              className="card text-center py-20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1e293b] mb-2">
                Ready to Search
              </h3>
              <p className="text-[#475569] text-lg">
                Enter search criteria above and click "Search Workers" to find professionals
              </p>
            </motion.div>
          ) : results.length === 0 ? (
            <motion.div 
              className="card text-center py-20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-[#1e293b] mb-2">
                No workers found
              </h3>
              <p className="text-[#475569] text-lg">
                Try adjusting your search criteria
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {sortedResults.map((worker, index) => {
                  console.log(`[SearchResults] ===== Rendering WorkerCard #${index + 1} =====`);
                  console.log('[SearchResults] Worker ID:', worker.id);
                  console.log('[SearchResults] Worker name:', worker.user?.fullName);
                  console.log('[SearchResults] Worker jobRole:', worker.jobRole);
                  return (
                    <motion.div key={worker.id || index} variants={itemVariants}>
                      <WorkerCard worker={worker} />
                    </motion.div>
                  );
                })}
              </motion.div>
              {sortedResults.length === 0 && (
                <div className="card p-8 text-center text-yellow-600">
                  <p className="font-bold">Warning: sortedResults is empty even though results has items!</p>
                  <p>results.length: {results.length}</p>
                  <p>Please check the console for details.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
