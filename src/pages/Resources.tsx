import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, Tag, Users, Calendar, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Resource {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  readTime: string;
  facilitator: string;
  nextSession?: string;
  capacity?: number;
  currentMembers?: number;
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'Alcoholics Anonymous (AA)',
    description: 'A fellowship of people who share their experience, strength and hope with each other to solve their common problem and help others recover from alcoholism.',
    content: 'Regular meetings and support for individuals recovering from alcohol addiction.',
    category: 'Support Group',
    tags: ['addiction', 'recovery', 'substance-abuse'],
    readTime: 'Daily Sessions',
    facilitator: 'Licensed Counselors',
    nextSession: 'Today at 7:00 PM',
    capacity: 30,
    currentMembers: 18
  },
  {
    id: '2',
    title: 'Narcotics Anonymous (NA)',
    description: 'NA is a nonprofit fellowship of people who share their recovery from drug addiction through regular meetings and mutual support.',
    content: 'Support group meetings focused on drug addiction recovery.',
    category: 'Support Group',
    tags: ['addiction', 'recovery', 'substance-abuse'],
    readTime: 'Daily Sessions',
    facilitator: 'Recovery Specialists',
    nextSession: 'Today at 8:00 PM',
    capacity: 30,
    currentMembers: 22
  },
  {
    id: '3',
    title: 'Criminal & Gang Anonymous (CGA)',
    description: 'A supportive community for individuals seeking to leave criminal lifestyles and gang affiliations.',
    content: 'Specialized support and guidance for lifestyle transformation.',
    category: 'Support Group',
    tags: ['addiction', 'anger-management', 'emotional-intelligence'],
    readTime: 'Bi-weekly Sessions',
    facilitator: 'Reformed Community Leaders',
    nextSession: 'Tomorrow at 6:00 PM',
    capacity: 20,
    currentMembers: 15
  },
  {
    id: '4',
    title: 'Anger Management Workshop',
    description: 'Learn effective techniques to manage anger and develop healthy emotional responses.',
    content: 'Interactive workshops on anger management strategies.',
    category: 'Workshop',
    tags: ['anger-management', 'emotional-intelligence'],
    readTime: '8 weeks program',
    facilitator: 'Dr. Sarah Johnson',
    nextSession: 'Next Monday at 5:00 PM',
    capacity: 15,
    currentMembers: 8
  },
  {
    id: '5',
    title: 'Emotional Intelligence Development',
    description: 'Develop your emotional awareness and improve interpersonal relationships.',
    content: 'Structured program for emotional intelligence development.',
    category: 'Program',
    tags: ['emotional-intelligence', 'personal-growth'],
    readTime: '12 weeks program',
    facilitator: 'Dr. Michael Chen',
    nextSession: 'Next Tuesday at 6:00 PM',
    capacity: 20,
    currentMembers: 12
  }
];

const categories = ['All', 'Support Group', 'Workshop', 'Program'];
const tags = ['addiction', 'recovery', 'substance-abuse', 'anger-management', 'emotional-intelligence', 'personal-growth'];

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="p-6 flex flex-col h-full">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {resource.category}
            </span>
            {resource.capacity && (
              <span className="text-sm text-gray-600">
                {resource.currentMembers}/{resource.capacity} members
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
          <p className="text-gray-600 mb-4">{resource.description}</p>
        </div>

        <div className="mt-auto space-y-4">
          {resource.nextSession && (
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{resource.nextSession}</span>
            </div>
          )}
          
          <div className="flex items-center text-gray-600">
            <Users className="h-5 w-5 mr-2" />
            <span>{resource.facilitator}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {resource.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          <Link
            to={`/support/groups`}
            className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mt-4"
          >
            Join Group
          </Link>
        </div>
      </div>
    </div>
  );
};

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      // Apply all filters together
      const matchesSearch = searchQuery === '' || [
        resource.title,
        resource.description,
        resource.content,
        resource.category,
        resource.facilitator,
        ...resource.tags
      ].some(field => 
        field.toLowerCase().includes(searchQuery.toLowerCase().trim())
      );

      const matchesCategory = selectedCategory === 'All' || 
        resource.category === selectedCategory;

      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => resource.tags.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [searchQuery, selectedCategory, selectedTags]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset category if searching
    if (e.target.value !== '') {
      setSelectedCategory('All');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTags([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Mental Health Resources</h1>
          <p className="text-gray-600">
            Find support groups and resources to help you on your journey
          </p>
        </div>
        <Heart className="h-12 w-12 text-purple-600" />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            {(searchQuery || selectedCategory !== 'All' || selectedTags.length > 0) && (
              <button
                onClick={clearFilters}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag)
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6 text-gray-600">
        Found {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          {(searchQuery || selectedCategory !== 'All' || selectedTags.length > 0) && (
            <button
              onClick={clearFilters}
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Resources;