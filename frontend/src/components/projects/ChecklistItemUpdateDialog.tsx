import { useState } from 'react';
import { X, Calendar, Link, Plus, Trash2, FileText, ExternalLink, Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectChecklistItem } from '@/types';

interface ChecklistItemUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: ProjectChecklistItem;
  onUpdate: (itemId: string, data: {
    isCompleted: boolean;
    completedDate?: string;
    notes?: string;
    links?: Array<{url: string; title: string; type: 'document' | 'link' | 'reference'}>;
  }) => Promise<void>;
}

export default function ChecklistItemUpdateDialog({
  isOpen,
  onClose,
  item,
  onUpdate
}: ChecklistItemUpdateDialogProps) {
  const [isCompleted, setIsCompleted] = useState(item.isCompleted);
  const [completedDate, setCompletedDate] = useState(
    item.completedDate || item.completedAt?.split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(item.notes || '');
  const [links, setLinks] = useState<Array<{url: string; title: string; type: 'document' | 'link' | 'reference'}>>(
    item.links?.map(link => ({ url: link.url, title: link.title, type: link.type })) || []
  );
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkType, setNewLinkType] = useState<'document' | 'link' | 'reference'>('link');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddLink = () => {
    if (!newLinkUrl.trim() || !newLinkTitle.trim()) return;
    
    setLinks(prev => [...prev, {
      url: newLinkUrl.trim(),
      title: newLinkTitle.trim(),
      type: newLinkType
    }]);
    
    setNewLinkUrl('');
    setNewLinkTitle('');
    setNewLinkType('link');
  };

  const handleRemoveLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(item.id, {
        isCompleted,
        completedDate: isCompleted ? completedDate : undefined,
        notes: notes.trim() || undefined,
        links: links.length > 0 ? links : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update checklist item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'reference': return <FileText className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Update Checklist Item</h2>
            <p className="text-sm text-muted-foreground mt-1">{item.title}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Completion Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Completion Status</label>
              {item.isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isCompleted}
                  onChange={() => setIsCompleted(false)}
                  className="text-blue-600"
                />
                <span className="text-sm">Not Completed</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isCompleted}
                  onChange={() => setIsCompleted(true)}
                  className="text-blue-600"
                />
                <span className="text-sm">Completed</span>
              </label>
            </div>

            {/* Completion Date */}
            {isCompleted && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  Completion Date
                </label>
                <input
                  type="date"
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText className="h-4 w-4" />
              Notes
            </label>
            <textarea
              placeholder="Add detailed notes about this checklist item..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <label className="text-sm font-medium text-gray-700">Attachments & Links</label>
            </div>

            {/* Existing Links */}
            {links.length > 0 && (
              <div className="space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="text-gray-500">
                      {getLinkIcon(link.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{link.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">{link.type}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLink(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Link */}
            <div className="space-y-3 p-4 border border-dashed border-gray-300 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Add New Link</div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="url"
                    placeholder="Enter URL..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <select
                  value={newLinkType}
                  onChange={(e) => setNewLinkType(e.target.value as 'document' | 'link' | 'reference')}
                  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="link">Link</option>
                  <option value="document">Document</option>
                  <option value="reference">Reference</option>
                </select>
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Link title..."
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <Button
                onClick={handleAddLink}
                disabled={!newLinkUrl.trim() || !newLinkTitle.trim()}
                size="sm"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>

          {/* Update History */}
          {item.updateHistory && item.updateHistory.length > 0 && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4" />
                Update History
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {item.updateHistory.map((update, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{update.updatedBy.name}</span>
                      <span>{formatDate(update.date)}</span>
                    </div>
                    <p className="text-sm text-gray-800">{update.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Status Info */}
          {item.lastUpdatedAt && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Clock className="h-4 w-4" />
                <span>
                  Last updated {formatDate(item.lastUpdatedAt)}
                  {item.lastUpdatedBy && ` by ${item.lastUpdatedBy.name}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update Item
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}