"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Send,
  Paperclip,
  Star,
  Eye,
  Reply,
  Phone,
  Mail,
  Calendar,
  User,
  Tag,
  FileText,
  Download,
  Archive,
  Trash2,
  Edit,
  MoreVertical
} from 'lucide-react';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'feature' | 'bug' | 'general';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messages: SupportMessage[];
  attachments?: string[];
}

interface SupportMessage {
  id: string;
  ticketId: string;
  sender: 'user' | 'support';
  senderName: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

export default function SupportSystem() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'general' as const
  });

  // Mock data - gerçek API'den gelecek
  useEffect(() => {
    const mockTickets: SupportTicket[] = [
      {
        id: 'TK-001',
        title: 'QR Kod Okunmuyor',
        description: 'Müşteriler QR kodu okutamıyor, menü açılmıyor.',
        priority: 'high',
        status: 'in-progress',
        category: 'technical',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T14:20:00Z',
        assignedTo: 'Teknik Destek',
        messages: [
          {
            id: 'MSG-001',
            ticketId: 'TK-001',
            sender: 'user',
            senderName: 'Hotel Admin',
            message: 'QR kodlarımız çalışmıyor, müşteriler menüye erişemiyor.',
            timestamp: '2024-01-15T10:30:00Z'
          },
          {
            id: 'MSG-002',
            ticketId: 'TK-001',
            sender: 'support',
            senderName: 'Teknik Destek',
            message: 'Sorunu inceliyoruz. QR kod URL\'lerinizi kontrol ediyoruz.',
            timestamp: '2024-01-15T11:15:00Z'
          }
        ]
      },
      {
        id: 'TK-002',
        title: 'Fatura Sorgusu',
        description: 'Bu ayki faturamda farklılık var.',
        priority: 'medium',
        status: 'open',
        category: 'billing',
        createdAt: '2024-01-14T16:45:00Z',
        updatedAt: '2024-01-14T16:45:00Z',
        messages: [
          {
            id: 'MSG-003',
            ticketId: 'TK-002',
            sender: 'user',
            senderName: 'Hotel Admin',
            message: 'Bu ayki faturamda beklenmedik bir tutar var.',
            timestamp: '2024-01-14T16:45:00Z'
          }
        ]
      },
      {
        id: 'TK-003',
        title: 'Yeni Özellik Talebi',
        description: 'Menüye fotoğraf ekleme özelliği istiyorum.',
        priority: 'low',
        status: 'resolved',
        category: 'feature',
        createdAt: '2024-01-13T09:20:00Z',
        updatedAt: '2024-01-14T15:30:00Z',
        assignedTo: 'Ürün Ekibi',
        messages: [
          {
            id: 'MSG-004',
            ticketId: 'TK-003',
            sender: 'user',
            senderName: 'Hotel Admin',
            message: 'Menü öğelerine fotoğraf ekleyebilmek istiyorum.',
            timestamp: '2024-01-13T09:20:00Z'
          },
          {
            id: 'MSG-005',
            ticketId: 'TK-003',
            sender: 'support',
            senderName: 'Ürün Ekibi',
            message: 'Bu özellik geliştirme planımızda var. Yakında eklenecek.',
            timestamp: '2024-01-14T15:30:00Z'
          }
        ]
      }
    ];
    setTickets(mockTickets);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <MessageSquare className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    const message: SupportMessage = {
      id: `MSG-${Date.now()}`,
      ticketId: selectedTicket.id,
      sender: 'user',
      senderName: 'Hotel Admin',
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicket.id 
        ? { ...ticket, messages: [...ticket.messages, message], updatedAt: new Date().toISOString() }
        : ticket
    ));

    setNewMessage('');
  };

  const handleCreateTicket = () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) return;

    const ticket: SupportTicket = {
      id: `TK-${String(tickets.length + 1).padStart(3, '0')}`,
      title: newTicket.title,
      description: newTicket.description,
      priority: newTicket.priority,
      status: 'open',
      category: newTicket.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [{
        id: `MSG-${Date.now()}`,
        ticketId: `TK-${String(tickets.length + 1).padStart(3, '0')}`,
        sender: 'user',
        senderName: 'Hotel Admin',
        message: newTicket.description,
        timestamp: new Date().toISOString()
      }]
    };

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({ title: '', description: '', priority: 'medium', category: 'general' });
    setShowNewTicketForm(false);
    setSelectedTicket(ticket);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destek Sistemi</h1>
          <p className="text-gray-600 mt-1">Teknik destek taleplerinizi yönetin</p>
        </div>
        <button
          onClick={() => setShowNewTicketForm(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Destek Talebi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Destek talebi ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="open">Açık</option>
                  <option value="in-progress">İşlemde</option>
                  <option value="resolved">Çözüldü</option>
                  <option value="closed">Kapalı</option>
                </select>
                
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tüm Öncelikler</option>
                  <option value="urgent">Acil</option>
                  <option value="high">Yüksek</option>
                  <option value="medium">Orta</option>
                  <option value="low">Düşük</option>
                </select>
              </div>
            </div>

            {/* Tickets List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {ticket.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                          {getPriorityIcon(ticket.priority)}
                          <span className="ml-1 capitalize">{ticket.priority}</span>
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">{ticket.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(ticket.updatedAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
              {/* Ticket Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedTicket.title}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {selectedTicket.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedTicket.priority)}`}>
                      {getPriorityIcon(selectedTicket.priority)}
                      <span className="ml-1 capitalize">{selectedTicket.priority}</span>
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusIcon(selectedTicket.status)}
                      <span className="ml-1 capitalize">{selectedTicket.status}</span>
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Talep No:</span> {selectedTicket.id}
                  </div>
                  <div>
                    <span className="font-medium">Kategori:</span> {selectedTicket.category}
                  </div>
                  <div>
                    <span className="font-medium">Oluşturulma:</span> {new Date(selectedTicket.createdAt).toLocaleString('tr-TR')}
                  </div>
                  <div>
                    <span className="font-medium">Son Güncelleme:</span> {new Date(selectedTicket.updatedAt).toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {message.senderName}
                        </div>
                        <div className="text-sm">{message.message}</div>
                        <div className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Destek Talebi Seçin
                </h3>
                <p className="text-gray-600">
                  Sol taraftan bir destek talebi seçerek detaylarını görüntüleyebilirsiniz.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Yeni Destek Talebi
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık
                  </label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sorununuzu kısaca açıklayın"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sorununuzu detaylı olarak açıklayın"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Öncelik
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                      <option value="urgent">Acil</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="technical">Teknik</option>
                      <option value="billing">Faturalandırma</option>
                      <option value="feature">Özellik Talebi</option>
                      <option value="bug">Hata Bildirimi</option>
                      <option value="general">Genel</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowNewTicketForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  onClick={handleCreateTicket}
                  disabled={!newTicket.title.trim() || !newTicket.description.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Talep Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
