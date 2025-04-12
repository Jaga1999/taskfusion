'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { useTaskStore } from "@/store/TaskStore"

interface ProfileStats {
  totalTasks: number;
  completedTasks: number;
  efficiency: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const taskStore = useTaskStore(state => state.implementation);
  const [stats, setStats] = useState<ProfileStats>({
    totalTasks: 0,
    completedTasks: 0,
    efficiency: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0
    }
  });

  useEffect(() => {
    // Load profile data from localStorage
    const savedName = localStorage.getItem('profile_name') || '';
    const savedAvatar = localStorage.getItem('profile_avatar') || '';
    setName(savedName);
    setAvatarUrl(savedAvatar);

    // Calculate statistics
    const tasks = taskStore.getFilteredTasks();
    const completed = tasks.filter(task => task.getStatus() === 'done');
    
    setStats({
      totalTasks: tasks.length,
      completedTasks: completed.length,
      efficiency: {
        daily: taskStore.getEfficiencyScore('daily'),
        weekly: taskStore.getEfficiencyScore('weekly'),
        monthly: taskStore.getEfficiencyScore('monthly'),
        yearly: taskStore.getEfficiencyScore('yearly')
      }
    });
  }, [taskStore]);

  const handleSave = () => {
    localStorage.setItem('profile_name', name);
    localStorage.setItem('profile_avatar', avatarUrl);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Profile Info */}
            <div className="flex items-center gap-8">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-4 flex-1">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    type="text"
                    id="avatar"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <Button onClick={handleSave}>Save Profile</Button>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Task Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="font-medium">Total Tasks</dt>
                      <dd>{stats.totalTasks}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Completed Tasks</dt>
                      <dd>{stats.completedTasks}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Completion Rate</dt>
                      <dd>
                        {stats.totalTasks > 0
                          ? `${((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)}%`
                          : '0%'}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Efficiency Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="font-medium">Daily</dt>
                      <dd>{stats.efficiency.daily.toFixed(1)}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Weekly</dt>
                      <dd>{stats.efficiency.weekly.toFixed(1)}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Monthly</dt>
                      <dd>{stats.efficiency.monthly.toFixed(1)}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Yearly</dt>
                      <dd>{stats.efficiency.yearly.toFixed(1)}%</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}