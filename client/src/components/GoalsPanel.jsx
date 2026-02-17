import { useState, useEffect } from 'react';
import { getGoals, createGoal, deleteGoal, getGoalStats } from '../services/api';
import { Target, Plus, Trash2, Trophy, Flame, Award, X, Loader2, CheckCircle, Calendar } from 'lucide-react';

const GoalsPanel = ({ onClose }) => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newGoal, setNewGoal] = useState({
    type: '30_day_challenge',
    title: '',
    target: 30,
    unit: 'days'
  });

  const goalTemplates = [
    { type: '30_day_challenge', title: '30-Day Writing Challenge', target: 30, unit: 'days', description: 'Write for 30 consecutive days' },
    { type: 'daily_word_count', title: 'Daily 500 Words', target: 500, unit: 'words', description: 'Write 500 words today' },
    { type: 'weekly_entries', title: 'Weekly Goal: 5 Entries', target: 5, unit: 'entries', description: 'Write 5 entries this week' },
    { type: 'monthly_entries', title: 'Monthly Goal: 20 Entries', target: 20, unit: 'entries', description: 'Write 20 entries this month' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [goalsRes, statsRes] = await Promise.all([
        getGoals(),
        getGoalStats()
      ]);
      setGoals(goalsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (template) => {
    try {
      await createGoal(template);
      setShowCreateForm(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await deleteGoal(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#22c55e';
    if (percentage >= 75) return '#84cc16';
    if (percentage >= 50) return '#eab308';
    if (percentage >= 25) return '#f97316';
    return '#ef4444';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysRemaining = (endDate) => {
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--app-accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={20} style={{ color: 'var(--gold-accent)' }} />
          <h2 className="font-serif text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Goals & Challenges
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-sm font-serif px-3 py-1 rounded-lg"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-parchment)' }}
        >
          Close
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
            <div className="text-2xl mb-1">{stats.active}</div>
            <p className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>Active</p>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ background: 'var(--app-accent-light)', border: '1px solid var(--app-accent)' }}>
            <div className="text-2xl mb-1">{stats.completed}</div>
            <p className="text-xs font-serif" style={{ color: 'var(--app-accent-dark)' }}>Completed</p>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
            <div className="text-2xl mb-1">{stats.badges.length}</div>
            <p className="text-xs font-serif" style={{ color: 'var(--text-muted)' }}>Badges</p>
          </div>
        </div>
      )}

      {/* Badges */}
      {stats && stats.badges.length > 0 && (
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
          <h3 className="font-serif font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Award size={16} />
            Earned Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.badges.map((badge, idx) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-lg text-sm font-serif"
                style={{ background: 'var(--app-accent-light)', color: 'var(--app-accent-dark)', border: '1px solid var(--app-accent)' }}
              >
                {badge.badge}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Goals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-medium" style={{ color: 'var(--text-primary)' }}>Active Goals</h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-serif"
            style={{ background: 'var(--app-accent)', color: 'white' }}
          >
            <Plus size={16} />
            New Goal
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-4 p-4 rounded-xl space-y-3" style={{ background: 'var(--bg-parchment)', border: '1px solid var(--border-light)' }}>
            <h4 className="font-serif font-medium" style={{ color: 'var(--text-primary)' }}>Choose a goal template:</h4>
            <div className="grid grid-cols-1 gap-2">
              {goalTemplates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCreateGoal(template)}
                  className="p-3 rounded-lg text-left hover:opacity-80 transition-opacity"
                  style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-light)' }}
                >
                  <p className="font-serif font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{template.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{template.description}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCreateForm(false)}
              className="w-full py-2 rounded-lg text-sm font-serif"
              style={{ color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-3">
          {goals.filter(g => g.isActive).length === 0 && !showCreateForm && (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <Target size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-serif">No active goals yet</p>
              <p className="text-sm mt-1">Start a challenge to build your writing habit!</p>
            </div>
          )}

          {goals.filter(g => g.isActive).map(goal => {
            const percentage = Math.min(Math.round((goal.current / goal.target) * 100), 100);
            const daysLeft = getDaysRemaining(goal.endDate);

            return (
              <div
                key={goal._id}
                className="p-4 rounded-xl"
                style={{ background: 'var(--bg-paper)', border: '1px solid var(--border-light)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-serif font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      {goal.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {daysLeft} days left
                      </span>
                      <span>{goal.current} / {goal.target} {goal.unit}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="p-1.5 rounded-lg hover:opacity-70"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-cream)' }}>
                  <div
                    className="absolute top-0 left-0 h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${percentage}%`,
                      background: getProgressColor(percentage)
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold" style={{ color: getProgressColor(percentage) }}>
                    {percentage}%
                  </span>
                  {percentage >= 100 && (
                    <span className="flex items-center gap-1 text-sm" style={{ color: '#22c55e' }}>
                      <CheckCircle size={16} />
                      Complete!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Goals */}
      {goals.filter(g => g.isCompleted).length > 0 && (
        <div>
          <h3 className="font-serif font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Trophy size={16} style={{ color: 'var(--gold-accent)' }} />
            Completed Goals
          </h3>
          <div className="space-y-2">
            {goals.filter(g => g.isCompleted).map(goal => (
              <div
                key={goal._id}
                className="p-3 rounded-lg flex items-center justify-between"
                style={{ background: 'var(--app-accent-light)', border: '1px solid var(--app-accent)' }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} style={{ color: 'var(--app-accent)' }} />
                  <div>
                    <p className="font-serif font-medium" style={{ color: 'var(--app-accent-dark)' }}>
                      {goal.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Completed {formatDate(goal.completedAt)}
                    </p>
                  </div>
                </div>
                {goal.badge && (
                  <span className="text-xl">{goal.badge}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPanel;
