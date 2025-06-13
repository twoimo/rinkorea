import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ExternalLink, Calendar, MapPin, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

const Projects = () => {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    location: '',
    date: '',
    image: '',
    description: '',
    url: '',
    features: ['']
  });

  const handleCreateProject = async () => {
    const { error } = await createProject({
      ...newProject,
      features: newProject.features.filter(f => f.trim() !== '')
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Project created successfully'
      });
      setNewProject({
        title: '',
        location: '',
        date: '',
        image: '',
        description: '',
        url: '',
        features: ['']
      });
    }
  };

  const handleUpdateProject = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    const { error } = await updateProject(id, {
      ...project,
      features: project.features.filter(f => f.trim() !== '')
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Project updated successfully'
      });
      setEditingProject(null);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    const { error } = await deleteProject(id);
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Project deleted successfully'
      });
    }
  };

  const addFeature = () => {
    setNewProject(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setNewProject(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">시공사례</h1>
            <p className="text-xl max-w-2xl mx-auto">
              린코리아의 세라믹 코팅제가 적용된 다양한 프로젝트를 통해 <br />
              우수한 품질과 성능을 확인하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {isAdmin && (
            <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Add New Project</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={newProject.title}
                  onChange={e => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  className="border rounded-lg p-2"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={newProject.location}
                  onChange={e => setNewProject(prev => ({ ...prev, location: e.target.value }))}
                  className="border rounded-lg p-2"
                />
                <input
                  type="text"
                  placeholder="Date"
                  value={newProject.date}
                  onChange={e => setNewProject(prev => ({ ...prev, date: e.target.value }))}
                  className="border rounded-lg p-2"
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  value={newProject.image}
                  onChange={e => setNewProject(prev => ({ ...prev, image: e.target.value }))}
                  className="border rounded-lg p-2"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={newProject.url}
                  onChange={e => setNewProject(prev => ({ ...prev, url: e.target.value }))}
                  className="border rounded-lg p-2"
                />
                <textarea
                  placeholder="Description"
                  value={newProject.description}
                  onChange={e => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  className="border rounded-lg p-2 md:col-span-2"
                  rows={3}
                />
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Features</h3>
                    <button
                      onClick={addFeature}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Feature
                    </button>
                  </div>
                  {newProject.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={e => updateFeature(index, e.target.value)}
                        className="border rounded-lg p-2 flex-1"
                        placeholder={`Feature ${index + 1}`}
                      />
                      <button
                        onClick={() => removeFeature(index)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleCreateProject}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg md:col-span-2 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add Project
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-700" />
                    </a>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => setEditingProject(project.id)}
                          className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors"
                        >
                          <Edit2 className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-white" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {editingProject === project.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={project.title}
                        onChange={e => updateProject(project.id, { title: e.target.value })}
                        className="border rounded-lg p-2 w-full"
                      />
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        <input
                          type="text"
                          value={project.location}
                          onChange={e => updateProject(project.id, { location: e.target.value })}
                          className="border rounded-lg p-2 flex-1"
                        />
                      </div>
                      <div className="flex items-center text-gray-600 mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        <input
                          type="text"
                          value={project.date}
                          onChange={e => updateProject(project.id, { date: e.target.value })}
                          className="border rounded-lg p-2 flex-1"
                        />
                      </div>
                      <textarea
                        value={project.description}
                        onChange={e => updateProject(project.id, { description: e.target.value })}
                        className="border rounded-lg p-2 w-full"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateProject(project.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" /> Save
                        </button>
                        <button
                          onClick={() => setEditingProject(null)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{project.title}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{project.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">{project.date}</span>
                      </div>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900">적용 특징:</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.features.map((feature, featureIndex) => (
                            <span
                              key={featureIndex}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">시공 실적</h2>
            <p className="text-xl text-gray-600">
              다양한 분야에서 인정받는 린코리아의 기술력
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">완료된 프로젝트</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600">고객 만족도</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">12+</div>
              <div className="text-gray-600">주요 제품군</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects;
