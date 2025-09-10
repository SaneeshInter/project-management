import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, ExternalLink, CheckCircle, XCircle, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ktMeetingsApi } from '@/lib/api';

interface KTMeeting {
  id: string;
  scheduledDate: string;
  duration: number;
  agenda: string;
  status: string;
  meetingLink?: string;
  notes?: string;
  project: {
    id: string;
    name: string;
    projectCode: string;
  };
  participants: Array<{
    user: {
      id: string;
      name: string;
      email: string;
    };
    role: string;
    isRequired: boolean;
    attended: boolean;
  }>;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface KTMeetingSchedulerProps {
  projectId?: string;
  showUpcomingOnly?: boolean;
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  RESCHEDULED: 'bg-orange-100 text-orange-800',
};

const roleColors: Record<string, string> = {
  ORGANIZER: 'bg-purple-100 text-purple-800',
  FACILITATOR: 'bg-blue-100 text-blue-800',
  PARTICIPANT: 'bg-gray-100 text-gray-800',
  TEAM_LEAD: 'bg-green-100 text-green-800',
  OBSERVER: 'bg-yellow-100 text-yellow-800',
};

export default function KTMeetingScheduler({ 
  projectId, 
  showUpcomingOnly = false 
}: KTMeetingSchedulerProps) {
  const [meetings, setMeetings] = useState<KTMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, [projectId, showUpcomingOnly]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data: KTMeeting[];
      if (showUpcomingOnly) {
        data = await ktMeetingsApi.getUpcoming(7);
      } else if (projectId) {
        data = await ktMeetingsApi.getAll(projectId);
      } else {
        data = await ktMeetingsApi.getAll();
      }
      
      setMeetings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch KT meetings');
      console.error('Error fetching KT meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString(),
    };
  };

  const isUpcoming = (scheduledDate: string) => {
    return new Date(scheduledDate) > new Date();
  };


  const handleUpdateStatus = async (meetingId: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date().toISOString();
      }
      
      await ktMeetingsApi.update(meetingId, updateData);
      fetchMeetings(); // Refresh the meetings
    } catch (err: any) {
      console.error('Error updating meeting status:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <XCircle className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Error Loading KT Meetings</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <Button onClick={fetchMeetings} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (meetings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No KT Meetings</p>
            <p className="text-sm">
              {showUpcomingOnly 
                ? 'No upcoming KT meetings scheduled.' 
                : projectId 
                  ? 'No KT meetings scheduled for this project.' 
                  : 'No KT meetings found.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {showUpcomingOnly ? 'Upcoming KT Meetings' : 'KT Meetings'}
        </h3>
        <Badge variant="outline" className="ml-2">
          {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {meetings.map((meeting) => {
        const dateTime = formatDateTime(meeting.scheduledDate);
        const upcoming = isUpcoming(meeting.scheduledDate);

        return (
          <Card key={meeting.id} className={`transition-all hover:shadow-md ${
            upcoming ? 'border-blue-200 bg-blue-50/50' : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">
                    {meeting.project.name}
                    <Badge variant="outline" className="ml-2">
                      {meeting.project.projectCode}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {dateTime.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {dateTime.time} ({meeting.duration}min)
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={statusColors[meeting.status] || 'bg-gray-100 text-gray-800'}>
                    {meeting.status.replace('_', ' ')}
                  </Badge>
                  {upcoming && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      Upcoming
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {meeting.agenda && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Agenda</h5>
                  <p className="text-sm text-gray-600">{meeting.agenda}</p>
                </div>
              )}

              {meeting.participants.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Participants</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {meeting.participants.map((participant) => (
                      <div 
                        key={participant.user.id} 
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <div>
                            <p className="text-sm font-medium">{participant.user.name}</p>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${roleColors[participant.role] || 'bg-gray-100 text-gray-800'}`}
                              >
                                {participant.role.replace('_', ' ')}
                              </Badge>
                              {participant.isRequired && (
                                <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {!upcoming && meeting.status === 'COMPLETED' && (
                          <div className="flex items-center">
                            {participant.attended ? (
                              <Badge className="text-xs bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Attended
                              </Badge>
                            ) : (
                              <Badge className="text-xs bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Absent
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  {meeting.meetingLink && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(meeting.meetingLink, '_blank')}
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Join Meeting
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                  
                  <span className="text-xs text-gray-500">
                    Organized by {meeting.createdBy.name}
                  </span>
                </div>

                {upcoming && meeting.status === 'SCHEDULED' && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(meeting.id, 'IN_PROGRESS')}
                    >
                      Start Meeting
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(meeting.id, 'RESCHEDULED')}
                    >
                      Reschedule
                    </Button>
                  </div>
                )}

                {meeting.status === 'IN_PROGRESS' && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(meeting.id, 'COMPLETED')}
                  >
                    Mark Complete
                  </Button>
                )}
              </div>

              {meeting.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Meeting Notes</h5>
                  <p className="text-sm text-gray-600">{meeting.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}