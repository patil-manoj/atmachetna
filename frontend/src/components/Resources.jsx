import { useState } from 'react'
import { XMarkIcon, BookOpenIcon, PlayIcon, LinkIcon, DocumentIcon } from '@heroicons/react/24/outline'

function Resources({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState('academic')

  const resources = {
    academic: [
      {
        title: 'Study Techniques and Time Management',
        type: 'guide',
        description: 'Learn effective study methods and how to manage your time better.',
        link: '#',
        icon: BookOpenIcon
      },
      {
        title: 'Exam Stress Management',
        type: 'article',
        description: 'Tips and techniques to handle exam anxiety and stress.',
        link: '#',
        icon: DocumentIcon
      },
      {
        title: 'Note-Taking Strategies',
        type: 'video',
        description: 'Video guide on effective note-taking methods.',
        link: '#',
        icon: PlayIcon
      }
    ],
    career: [
      {
        title: 'Career Exploration Guide',
        type: 'guide',
        description: 'Discover different career paths and opportunities.',
        link: '#',
        icon: BookOpenIcon
      },
      {
        title: 'Interview Preparation',
        type: 'article',
        description: 'How to prepare for college and job interviews.',
        link: '#',
        icon: DocumentIcon
      },
      {
        title: 'Resume Building Workshop',
        type: 'video',
        description: 'Learn to create an impressive resume.',
        link: '#',
        icon: PlayIcon
      }
    ],
    mental: [
      {
        title: 'Stress and Anxiety Management',
        type: 'guide',
        description: 'Techniques to manage stress and anxiety effectively.',
        link: '#',
        icon: BookOpenIcon
      },
      {
        title: 'Mindfulness and Meditation',
        type: 'article',
        description: 'Introduction to mindfulness practices for mental well-being.',
        link: '#',
        icon: DocumentIcon
      },
      {
        title: 'Building Self-Confidence',
        type: 'video',
        description: 'Strategies to boost your self-confidence and self-esteem.',
        link: '#',
        icon: PlayIcon
      }
    ],
    social: [
      {
        title: 'Communication Skills',
        type: 'guide',
        description: 'Improve your verbal and non-verbal communication.',
        link: '#',
        icon: BookOpenIcon
      },
      {
        title: 'Building Healthy Relationships',
        type: 'article',
        description: 'Guidelines for maintaining healthy friendships and relationships.',
        link: '#',
        icon: DocumentIcon
      },
      {
        title: 'Conflict Resolution',
        type: 'video',
        description: 'Learn how to resolve conflicts peacefully.',
        link: '#',
        icon: PlayIcon
      }
    ]
  }

  const categories = [
    { id: 'academic', name: 'Academic', description: 'Study tips and academic success' },
    { id: 'career', name: 'Career', description: 'Career guidance and preparation' },
    { id: 'mental', name: 'Mental Health', description: 'Mental wellness and self-care' },
    { id: 'social', name: 'Social Skills', description: 'Communication and relationships' }
  ]

  const getTypeColor = (type) => {
    switch (type) {
      case 'guide':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'article':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'video':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">
                Counseling Resources
              </h3>
              <p className="text-blue-100 mt-2">
                Helpful resources for your personal and academic growth
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">

          {/* Category Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`py-4 px-1 border-b-3 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    activeCategory === category.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg px-4'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-lg px-4'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{category.name}</div>
                    <div className="text-xs mt-1 opacity-75">{category.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Category Description */}
          <div className="mb-8 text-center">
            <p className="text-gray-600 text-lg">
              {categories.find(cat => cat.id === activeCategory)?.description}
            </p>
          </div>

          {/* Resources Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources[activeCategory].map((resource, index) => {
              const IconComponent = resource.icon
              return (
                <div key={index} className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 hover:-translate-y-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {resource.title}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(resource.type)}`}>
                          {resource.type}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {resource.description}
                      </p>
                      <button
                        onClick={() => {
                          if (resource.link === '#') {
                            alert('Resource will be available soon!')
                          } else {
                            window.open(resource.link, '_blank')
                          }
                        }}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm group-hover:underline transition-colors"
                      >
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Access Resource
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Emergency Help Section */}
          <div className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-yellow-800 mb-4">
                  Need Immediate Help?
                </h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-yellow-700">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="font-semibold text-yellow-800 mb-1">Counseling Helpline</div>
                    <div className="text-lg font-bold">1800-XXX-XXXX</div>
                    <div className="text-xs opacity-75">24/7 Support</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="font-semibold text-yellow-800 mb-1">Emergency Services</div>
                    <div className="text-lg font-bold">112</div>
                    <div className="text-xs opacity-75">Immediate Help</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="font-semibold text-yellow-800 mb-1">Campus Counselor</div>
                    <div className="text-sm font-bold">counselor@atmachetna.com</div>
                    <div className="text-xs opacity-75">Email Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              💡 Tip: Bookmark useful resources for quick access
            </p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Resources
