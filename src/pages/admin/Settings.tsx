// src/pages/admin/Settings.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { settingsService, SystemSettings, UserSettings } from "@/services/settingsService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Save,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  Users,
  Mail,
  Phone,
  MapPin,
  Clock,
  Palette,
  Globe,
  Download,
  Upload,
  Trash2,
  Loader2,
  RefreshCw
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemSettings, setSystemSettings] = useState<Partial<SystemSettings>>({});
  const [userSettings, setUserSettings] = useState<Partial<UserSettings>>({});
  const [activeTab, setActiveTab] = useState("general");
  const [users, setUsers] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
    fetchUsers();
    fetchBackups();
    fetchLogs();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const system = await settingsService.getSystemSettings();
      setSystemSettings(system);
      
      if (user) {
        const userPrefs = await settingsService.getUserSettings(user.id);
        setUserSettings(userPrefs);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await settingsService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchBackups = async () => {
    try {
      const data = await settingsService.getBackupHistory();
      setBackups(data);
    } catch (error) {
      console.error("Error fetching backups:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await settingsService.getSystemLogs(50);
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const handleSystemSettingChange = (key: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleUserSettingChange = (key: string, value: any) => {
    setUserSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSystemSettings = async () => {
    try {
      setSaving(true);
      await settingsService.updateSystemSettings(systemSettings);
      toast({
        title: "Success",
        description: "System settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveUserSettings = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      await settingsService.updateUserSettings(user.id, userSettings);
      toast({
        title: "Success",
        description: "User preferences saved successfully",
      });
    } catch (error) {
      console.error("Error saving user settings:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUserRoleChange = async (userId: string, role: string) => {
    try {
      await settingsService.updateUserRole(userId, role);
      await fetchUsers();
      toast({
        title: "Success",
        description: "User role updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleUserStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await settingsService.toggleUserStatus(userId, !currentStatus);
      await fetchUsers();
      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleBackup = async () => {
    try {
      const tables = ['users', 'women', 'doctors', 'asha_workers', 'deliveries', 'inventory', 'consultations', 'payments', 'alerts'];
      const filename = await settingsService.createBackup(tables);
      await fetchBackups();
      toast({
        title: "Success",
        description: `Backup created: ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create backup",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) return;
    
    try {
      await settingsService.restoreFromBackup(selectedFile);
      toast({
        title: "Success",
        description: "Database restored successfully",
      });
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore database",
        variant: "destructive",
      });
    }
  };

  const handleClearLogs = async () => {
    try {
      await settingsService.clearLogs(30);
      await fetchLogs();
      toast({
        title: "Success",
        description: "Old logs cleared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear logs",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure system settings and manage users
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={systemSettings.site_name || ''}
                    onChange={(e) => handleSystemSettingChange('site_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={systemSettings.primary_color || '#4f46e5'}
                      onChange={(e) => handleSystemSettingChange('primary_color', e.target.value)}
                      className="w-20"
                    />
                    <Input
                      value={systemSettings.primary_color || '#4f46e5'}
                      onChange={(e) => handleSystemSettingChange('primary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_email">Support Email</Label>
                <Input
                  id="support_email"
                  type="email"
                  value={systemSettings.support_email || ''}
                  onChange={(e) => handleSystemSettingChange('support_email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support_phone">Support Phone</Label>
                <Input
                  id="support_phone"
                  value={systemSettings.support_phone || ''}
                  onChange={(e) => handleSystemSettingChange('support_phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_number">Emergency Number</Label>
                <Input
                  id="emergency_number"
                  value={systemSettings.emergency_number || ''}
                  onChange={(e) => handleSystemSettingChange('emergency_number', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="working_hours_start">Working Hours Start</Label>
                  <Input
                    id="working_hours_start"
                    type="time"
                    value={systemSettings.working_hours_start || '09:00'}
                    onChange={(e) => handleSystemSettingChange('working_hours_start', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="working_hours_end">Working Hours End</Label>
                  <Input
                    id="working_hours_end"
                    type="time"
                    value={systemSettings.working_hours_end || '18:00'}
                    onChange={(e) => handleSystemSettingChange('working_hours_end', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Working Days</Label>
                <div className="grid grid-cols-5 gap-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={day}
                        checked={systemSettings.working_days?.includes(day)}
                        onChange={(e) => {
                          const days = systemSettings.working_days || [];
                          if (e.target.checked) {
                            handleSystemSettingChange('working_days', [...days, day]);
                          } else {
                            handleSystemSettingChange('working_days', days.filter(d => d !== day));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={day} className="capitalize">{day.slice(0, 3)}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_delivery_distance">Max Delivery Distance (km)</Label>
                  <Input
                    id="max_delivery_distance"
                    type="number"
                    value={systemSettings.max_delivery_distance || 50}
                    onChange={(e) => handleSystemSettingChange('max_delivery_distance', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultation_buffer">Consultation Buffer (minutes)</Label>
                  <Input
                    id="consultation_buffer"
                    type="number"
                    value={systemSettings.consultation_buffer_minutes || 30}
                    onChange={(e) => handleSystemSettingChange('consultation_buffer_minutes', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={saveSystemSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save General Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">System Notifications</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable_notifications">Enable Notifications</Label>
                    <Switch
                      id="enable_notifications"
                      checked={systemSettings.enable_notifications}
                      onCheckedChange={(checked) => handleSystemSettingChange('enable_notifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable_email_alerts">Email Alerts</Label>
                    <Switch
                      id="enable_email_alerts"
                      checked={systemSettings.enable_email_alerts}
                      onCheckedChange={(checked) => handleSystemSettingChange('enable_email_alerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable_sms_alerts">SMS Alerts</Label>
                    <Switch
                      id="enable_sms_alerts"
                      checked={systemSettings.enable_sms_alerts}
                      onCheckedChange={(checked) => handleSystemSettingChange('enable_sms_alerts', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Auto Assignment</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto_assign_asha">Auto-assign ASHA Workers</Label>
                    <Switch
                      id="auto_assign_asha"
                      checked={systemSettings.auto_assign_asha}
                      onCheckedChange={(checked) => handleSystemSettingChange('auto_assign_asha', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto_assign_delivery">Auto-assign Delivery Partners</Label>
                    <Switch
                      id="auto_assign_delivery"
                      checked={systemSettings.auto_assign_delivery}
                      onCheckedChange={(checked) => handleSystemSettingChange('auto_assign_delivery', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Alert Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="alert_escalation">Alert Escalation Time (minutes)</Label>
                  <Input
                    id="alert_escalation"
                    type="number"
                    value={systemSettings.alert_escalation_minutes || 60}
                    onChange={(e) => handleSystemSettingChange('alert_escalation_minutes', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium">Your Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="user_notifications">Enable Notifications</Label>
                    <Switch
                      id="user_notifications"
                      checked={userSettings.notifications_enabled}
                      onCheckedChange={(checked) => handleUserSettingChange('notifications_enabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                    <Switch
                      id="email_notifications"
                      checked={userSettings.email_notifications}
                      onCheckedChange={(checked) => handleUserSettingChange('email_notifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push_notifications">Push Notifications</Label>
                    <Switch
                      id="push_notifications"
                      checked={userSettings.push_notifications}
                      onCheckedChange={(checked) => handleUserSettingChange('push_notifications', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <select
                    id="theme"
                    value={userSettings.theme || 'system'}
                    onChange={(e) => handleUserSettingChange('theme', e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    value={userSettings.language || 'en'}
                    onChange={(e) => handleUserSettingChange('language', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                    <option value="kn">Kannada</option>
                    <option value="ml">Malayalam</option>
                  </select>
                </div>

                <Button onClick={saveUserSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-left py-2">Phone</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Last Login</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="py-2">{user.full_name}</td>
                        <td className="py-2">{user.email}</td>
                        <td className="py-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                            className="p-1 border rounded text-sm"
                          >
                            <option value="admin">Admin</option>
                            <option value="delivery">Delivery</option>
                            <option value="asha">ASHA</option>
                            <option value="woman">Woman</option>
                          </select>
                        </td>
                        <td className="py-2">{user.phone}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2">{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                        <td className="py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserStatusToggle(user.id, user.is_active)}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup & Restore */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Backup & Restore
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Create Backup</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download a complete backup of all database tables
                    </p>
                    <Button onClick={handleBackup} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Backup
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Restore Database</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a backup file to restore
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="mb-2"
                    />
                    <Button 
                      onClick={handleRestore} 
                      disabled={!selectedFile}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-medium mb-2">Recent Backups</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Filename</th>
                        <th className="text-left py-2">Size</th>
                        <th className="text-left py-2">Tables</th>
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((backup) => (
                        <tr key={backup.id} className="border-b">
                          <td className="py-2 font-mono text-sm">{backup.filename}</td>
                          <td className="py-2">{formatFileSize(backup.size)}</td>
                          <td className="py-2">{backup.tables?.length || 0} tables</td>
                          <td className="py-2">{new Date(backup.created_at).toLocaleString()}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              backup.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {backup.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  System Logs
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchLogs}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearLogs}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Old
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Timestamp</th>
                      <th className="text-left py-2">Level</th>
                      <th className="text-left py-2">Message</th>
                      <th className="text-left py-2">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b">
                        <td className="py-2">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            log.level === 'error' ? 'bg-red-100 text-red-800' :
                            log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="py-2">{log.message}</td>
                        <td className="py-2">{log.user_id || 'System'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}