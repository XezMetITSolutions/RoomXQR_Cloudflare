"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguageStore } from '@/store/languageStore';
import { QrCode, Download, Printer, Copy, Check, X } from 'lucide-react';
import QRCode from 'qrcode.react';
import QRCodeGenerator from 'qrcode';

export default function QRKodPage() {
  const { token, user } = useAuth();
  const { currentLanguage, getTranslation } = useLanguageStore();
  const [selectedRoom, setSelectedRoom] = useState('');
  const [qrCodeURL, setQRCodeURL] = useState('');
  const [copied, setCopied] = useState(false);
  const [customRoom, setCustomRoom] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [baseURL, setBaseURL] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [customRooms, setCustomRooms] = useState<any[]>([]);
  const [selectedCustomRoom, setSelectedCustomRoom] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [floorCount, setFloorCount] = useState(4);
  const [roomsPerFloor, setRoomsPerFloor] = useState(5);
  const [generatedRooms, setGeneratedRooms] = useState<any[]>([]);
  const [useGeneratedRooms, setUseGeneratedRooms] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [roomToSelect, setRoomToSelect] = useState<string | null>(null);
  const [guestNameInput, setGuestNameInput] = useState('');
  const [guestTokenLoading, setGuestTokenLoading] = useState(false);
  const [guestCheckIn, setGuestCheckIn] = useState(new Date().toISOString().split('T')[0]);
  const [guestCheckOut, setGuestCheckOut] = useState('');

  // Otomatik oda oluşturma fonksiyonu
  const generateRooms = (floors: number, roomsPerFloor: number) => {
    const generated: any[] = [];
    for (let floor = 1; floor <= floors; floor++) {
      for (let room = 1; room <= roomsPerFloor; room++) {
        const roomNumber = `${floor}${room.toString().padStart(2, '0')}`;
        generated.push({
          number: roomNumber,
          floor: floor,
          id: `generated-${roomNumber}`
        });
      }
    }
    return generated;
  };

  const handleGenerateRooms = () => {
    const newRooms = generateRooms(floorCount, roomsPerFloor);
    setGeneratedRooms(newRooms);
    setUseGeneratedRooms(true);

    // localStorage'a kaydet
    if (typeof window !== 'undefined') {
      localStorage.setItem('qrKod_generatedRooms', JSON.stringify(newRooms));
      localStorage.setItem('qrKod_useGeneratedRooms', 'true');
      localStorage.setItem('qrKod_floorCount', floorCount.toString());
      localStorage.setItem('qrKod_roomsPerFloor', roomsPerFloor.toString());
    }

    // İlk odayı seç
    if (newRooms.length > 0) {
      setSelectedRoom(newRooms[0].number);
      setQRCodeURL(`${baseURL}/guest/${newRooms[0].number}`);
    }
  };

  // Browser tab title'ını ayarla
  useEffect(() => {
    const title = getTranslation('sidebar.qr_generator');
    document.title = `${title} - RoomXQR`;
  }, [currentLanguage, getTranslation]);

  useEffect(() => {
    // Client-side'da baseURL'i ayarla
    setBaseURL(window.location.origin);

    // localStorage'dan kaydedilmiş odaları yükle
    if (typeof window !== 'undefined') {
      const savedGeneratedRooms = localStorage.getItem('qrKod_generatedRooms');
      const savedUseGeneratedRooms = localStorage.getItem('qrKod_useGeneratedRooms');
      const savedFloorCount = localStorage.getItem('qrKod_floorCount');
      const savedRoomsPerFloor = localStorage.getItem('qrKod_roomsPerFloor');
      const savedCustomRooms = localStorage.getItem('qrKod_customRooms');

      if (savedGeneratedRooms && savedUseGeneratedRooms === 'true') {
        try {
          const parsedRooms = JSON.parse(savedGeneratedRooms);
          setGeneratedRooms(parsedRooms);
          setUseGeneratedRooms(true);

          // İlk odayı seç
          if (parsedRooms.length > 0) {
            setSelectedRoom(parsedRooms[0].number);
            setQRCodeURL(`${window.location.origin}/guest/${parsedRooms[0].number}`);
          }
        } catch (error) {
          console.error('Kaydedilmiş odalar yüklenirken hata:', error);
        }
      }

      if (savedFloorCount) {
        setFloorCount(parseInt(savedFloorCount) || 4);
      }

      if (savedRoomsPerFloor) {
        setRoomsPerFloor(parseInt(savedRoomsPerFloor) || 5);
      }

      if (savedCustomRooms) {
        try {
          const parsedCustomRooms = JSON.parse(savedCustomRooms);
          setCustomRooms(parsedCustomRooms);
        } catch (error) {
          console.error('Kaydedilmiş özel odalar yüklenirken hata:', error);
        }
      }
    }
  }, []);

  // Veritabanından odaları yükle
  useEffect(() => {
    const loadRooms = async () => {
      if (!token || !user) return;

      try {
        setIsLoading(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';

        // URL'den tenant slug'ını al
        let tenantSlug = 'demo';
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const subdomain = hostname.split('.')[0];
          if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
            tenantSlug = subdomain;
          }
        }

        const response = await fetch(`${API_BASE_URL}/api/rooms`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant': tenantSlug
          }
        });

        if (response.ok) {
          const data = await response.json();
          const roomsData = data.rooms || [];

          // Oda numaralarına göre sırala ve formatla
          const formattedRooms = roomsData.map((room: any) => ({
            number: room.number || room.id,
            floor: room.floor || Math.floor(parseInt(room.number || '0') / 100) || 1,
            id: room.id,
            guests: room.guests || []
          })).sort((a: any, b: any) => {
            const numA = parseInt(a.number) || 0;
            const numB = parseInt(b.number) || 0;
            return numA - numB;
          });

          setRooms(formattedRooms);

          // İlk odayı seç
          if (formattedRooms.length > 0) {
            setSelectedRoom(formattedRooms[0].number);
            setQRCodeURL(`${baseURL}/guest/${formattedRooms[0].number}`);
          }
        }
      } catch (error) {
        console.error('Odalar yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, [token, user, baseURL]);

  const handleCopy = () => {
    const currentRoom = showCustomInput ? selectedCustomRoom : selectedRoom;
    const url = qrCodeURL || `${baseURL}/guest/${currentRoom}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCustomRoom = () => {
    if (customRoom.trim() && !customRooms.find(room => room.number === customRoom.trim())) {
      const newRoom = {
        number: customRoom.trim(),
        floor: 'Özel',
        isCustom: true
      };
      const updatedCustomRooms = [...customRooms, newRoom];
      setCustomRooms(updatedCustomRooms);
      setSelectedCustomRoom(customRoom.trim());
      setQRCodeURL(`${baseURL}/guest/${customRoom.trim()}`);
      setCustomRoom('');

      // localStorage'a kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('qrKod_customRooms', JSON.stringify(updatedCustomRooms));
      }
    }
  };

  const handleDeleteCustomRoom = (roomNumber) => {
    const updatedCustomRooms = customRooms.filter(room => room.number !== roomNumber);
    setCustomRooms(updatedCustomRooms);
    if (selectedCustomRoom === roomNumber) {
      setSelectedCustomRoom('');
      setQRCodeURL('');
    }

    // localStorage'a kaydet
    if (typeof window !== 'undefined') {
      localStorage.setItem('qrKod_customRooms', JSON.stringify(updatedCustomRooms));
    }
  };

  const handlePrint = async () => {
    const currentRoom = showCustomInput ? selectedCustomRoom : selectedRoom;
    const url = qrCodeURL || `${baseURL}/guest/${currentRoom}`;

    try {
      // QR kod PNG olarak oluştur
      const qrDataURL = await QRCodeGenerator.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      console.log('QR kod oluşturuldu:', qrDataURL.substring(0, 50) + '...');

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${getTranslation('sidebar.qr_generator')} - ${getTranslation('qr.room')} ${currentRoom}</title>
            <style>
              @page {
                size: A4;
                margin: 20mm;
              }
              body { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                margin: 0;
                font-family: Arial, sans-serif;
                background: white;
              }
              .container {
                text-align: center;
                padding: 40px;
                border: 2px solid #d4af37;
                border-radius: 12px;
                background: white;
                max-width: 500px;
                width: 100%;
              }
              .qr-container {
                margin: 30px auto;
                padding: 20px;
                background: white;
                border: 3px solid #d4af37;
                border-radius: 12px;
                display: inline-block;
              }
              .qr-image {
                width: 300px;
                height: 300px;
                display: block;
                border: none;
              }
              h1 { 
                color: #1e3a8a; 
                font-size: 36px;
                margin-bottom: 20px;
                font-weight: bold;
              }
              .url-text { 
                color: #666; 
                margin-top: 20px;
                font-size: 14px;
                word-break: break-all;
                background: #f8f9fa;
                padding: 10px;
                border-radius: 6px;
                border: 1px solid #e9ecef;
              }
              .instructions {
                margin-top: 30px;
                text-align: left;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
                padding: 20px;
                background: #f0f9ff;
                border-radius: 8px;
                border: 1px solid #bae6fd;
              }
              .instructions h3 {
                color: #1e3a8a;
                font-size: 18px;
                margin-bottom: 15px;
                font-weight: bold;
              }
              .instructions ol {
                color: #666;
                font-size: 14px;
                line-height: 1.6;
                margin: 0;
                padding-left: 20px;
              }
              .instructions li {
                margin-bottom: 8px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${getTranslation('qr.room')} ${currentRoom}</h1>
              <div class="qr-container">
                <img src="${qrDataURL}" alt="${getTranslation('sidebar.qr_generator')} - ${getTranslation('qr.room')} ${currentRoom}" class="qr-image" onload="console.log('QR kod yüklendi')" onerror="console.error('QR kod yüklenemedi')" />
              </div>
              <div class="url-text">
                <strong>${getTranslation('qr.url')}:</strong> ${url}
              </div>
              <div class="instructions">
                <h3>${getTranslation('qr.instructions_title')}:</h3>
                <ol>
                  <li>${getTranslation('qr.instruction_1')}</li>
                  <li>${getTranslation('qr.instruction_2')}</li>
                  <li>${getTranslation('qr.instruction_3')}</li>
                  <li>${getTranslation('qr.instruction_4')}</li>
                </ol>
              </div>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();

        // Yazdırma işlemini biraz geciktir
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      }
    } catch (error) {
      console.error('QR kod oluşturma hatası:', error);
      alert('QR kod oluşturulurken hata oluştu: ' + error.message);
    }
  };

  const handleDownload = async () => {
    const currentRoom = showCustomInput ? selectedCustomRoom : selectedRoom;
    const url = qrCodeURL || `${baseURL}/guest/${currentRoom}`;

    try {
      // QR kod PNG olarak oluştur
      const qrDataURL = await QRCodeGenerator.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // PNG dosyası olarak indir
      const link = document.createElement('a');
      link.href = qrDataURL;
      link.download = `qr-kod-oda-${currentRoom}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('QR kod indirme hatası:', error);
      alert('QR kod indirilirken hata oluştu: ' + error.message);
    }
  };

  const handleDownloadAll = async () => {
    const roomsToDownload = showCustomInput ? customRooms : (useGeneratedRooms ? generatedRooms : rooms);

    if (roomsToDownload.length === 0) {
      alert('İndirilecek oda bulunamadı!');
      return;
    }

    try {
      // Tüm odalar için QR kodları oluştur
      const qrPromises = roomsToDownload.map(async (room) => {
        const url = `${baseURL}/guest/${room.number}`;
        const qrDataURL = await QRCodeGenerator.toDataURL(url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        return {
          room: room.number,
          floor: room.floor,
          url: url,
          qrDataURL: qrDataURL
        };
      });

      const qrData = await Promise.all(qrPromises);

      // HTML dosyası oluştur
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${getTranslation('qr.download_all_title')}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background: #f8f9fa;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header h1 {
              color: #1e3a8a;
              margin-bottom: 10px;
            }
            .rooms-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
            }
            .room { 
              margin: 0; 
              padding: 20px; 
              border: 2px solid #d4af37; 
              border-radius: 12px; 
              background: white;
              text-align: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .room h3 { 
              color: #1e3a8a; 
              margin-bottom: 15px; 
              font-size: 18px;
            }
            .qr-code { 
              margin: 15px 0; 
            }
            .qr-image {
              width: 200px;
              height: 200px;
              border: 2px solid #d4af37;
              border-radius: 8px;
            }
            .url { 
              color: #666; 
              font-size: 12px; 
              word-break: break-all; 
              background: #f8f9fa;
              padding: 8px;
              border-radius: 4px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding: 20px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${getTranslation('qr.download_all_title')} - ${roomsToDownload.length} ${getTranslation('qr.room')}</h1>
            <p>${getTranslation('qr.created_date')}: ${new Date().toLocaleString(currentLanguage === 'tr' ? 'tr-TR' : currentLanguage === 'de' ? 'de-DE' : 'en-US')}</p>
          </div>
          
          <div class="rooms-grid">
            ${qrData.map(room => `
              <div class="room">
                <h3>${getTranslation('qr.room')} ${room.room} - ${getTranslation('qr.floor')} ${room.floor}</h3>
                <div class="qr-code">
                  <img src="${room.qrDataURL}" alt="${getTranslation('sidebar.qr_generator')} - ${getTranslation('qr.room')} ${room.room}" class="qr-image" />
                </div>
                <div class="url">${getTranslation('qr.url')}: ${room.url}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>${getTranslation('qr.auto_generated_note')}</p>
            <p>${getTranslation('qr.unique_note')}</p>
          </div>
        </body>
        </html>
      `;

      // HTML dosyası olarak indir
      const dataBlob = new Blob([htmlContent], { type: 'text/html' });
      const url_download = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url_download;
      link.download = `qr-kodlar-tum-odalar-${roomsToDownload.length}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url_download);
    } catch (error) {
      console.error('Toplu QR kod indirme hatası:', error);
      alert('QR kodlar indirilirken hata oluştu!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{getTranslation('sidebar.qr_generator')}</h1>
        <p className="text-gray-600">{getTranslation('page.qr.subtitle')}</p>
      </div>

      {/* Main QR Generator */}
      <div className="hotel-card p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Controls */}
          <div className="space-y-6">
            {/* Otel Konfigürasyonu */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-3">
                {getTranslation('qr.hotel_config')}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">
                    {getTranslation('qr.floor_count')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={floorCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setFloorCount(value);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('qrKod_floorCount', value.toString());
                      }
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">
                    {getTranslation('qr.rooms_per_floor')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={roomsPerFloor}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setRoomsPerFloor(value);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('qrKod_roomsPerFloor', value.toString());
                      }
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-3 text-xs text-blue-600 mb-3">
                <strong>{getTranslation('qr.total')}:</strong> {floorCount * roomsPerFloor} {getTranslation('qr.rooms_will_be_created')}
                <br />
                <strong>{getTranslation('qr.example')}:</strong> {floorCount} {getTranslation('qr.floor_count')} × {roomsPerFloor} {getTranslation('qr.rooms_per_floor')} = {Array.from({ length: Math.min(floorCount * roomsPerFloor, 3) }, (_, i) => {
                  const floor = Math.floor(i / roomsPerFloor) + 1;
                  const room = (i % roomsPerFloor) + 1;
                  return `${floor}${room.toString().padStart(2, '0')}`;
                }).join(', ')}...
              </div>
              <button
                onClick={handleGenerateRooms}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                {getTranslation('qr.create_rooms')}
              </button>
              {useGeneratedRooms && generatedRooms.length > 0 && (
                <div className="mt-2 text-xs text-green-600">
                  ✓ {generatedRooms.length} {getTranslation('qr.rooms_created')}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getTranslation('qr.select_room')}
              </label>

              {/* Toggle Buttons */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomRoom('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showCustomInput
                    ? 'bg-hotel-gold text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {useGeneratedRooms ? getTranslation('qr.generated_rooms') : getTranslation('qr.database_rooms')} ({isLoading ? '...' : (useGeneratedRooms ? generatedRooms.length : rooms.length)})
                </button>
                <button
                  onClick={() => setShowCustomInput(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showCustomInput
                    ? 'bg-hotel-gold text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {getTranslation('qr.custom_rooms')} ({customRooms.length})
                </button>
              </div>

              {/* Veritabanı Odaları Dropdown */}
              {!showCustomInput && (
                <>
                  {isLoading ? (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-gray-500">
                      {getTranslation('qr.loading_rooms')}
                    </div>
                  ) : (useGeneratedRooms ? generatedRooms : rooms).length > 0 ? (
                    <select
                      value={selectedRoom}
                      onChange={(e) => {
                        setSelectedRoom(e.target.value);
                        setQRCodeURL(`${baseURL}/guest/${e.target.value}`);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-lg"
                    >
                      {(useGeneratedRooms ? generatedRooms : rooms).map((room: any) => (
                        <option key={room.number} value={room.number}>
                          {getTranslation('qr.select_room')} {room.number} - {getTranslation('qr.floor_count')} {room.floor}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-gray-500">
                      {getTranslation('qr.no_rooms')}
                    </div>
                  )}
                </>
              )}

              {/* Özel Odalar */}
              {showCustomInput && (
                <div className="space-y-4">
                  {/* Yeni Oda Ekleme */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-900 mb-3">{getTranslation('qr.add_custom_room')}</h4>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={customRoom}
                        onChange={(e) => setCustomRoom(e.target.value)}
                        placeholder={getTranslation('qr.room_placeholder')}
                        className="flex-1 px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveCustomRoom()}
                      />
                      <button
                        onClick={handleSaveCustomRoom}
                        disabled={!customRoom.trim()}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                      >
                        {getTranslation('qr.save')}
                      </button>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      {getTranslation('qr.enter_to_save')}
                    </p>
                  </div>

                  {/* Kaydedilen Özel Odalar */}
                  {customRooms.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        {getTranslation('qr.saved_custom_rooms')} ({customRooms.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {customRooms.map((room) => (
                          <div
                            key={room.number}
                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${selectedCustomRoom === room.number
                              ? 'border-hotel-gold bg-hotel-gold text-white'
                              : 'border-gray-200 hover:border-hotel-gold hover:bg-gray-50'
                              }`}
                            onClick={() => {
                              setSelectedCustomRoom(room.number);
                              setQRCodeURL(`${baseURL}/guest/${room.number}`);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-sm">{room.number}</div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomRoom(room.number);
                                }}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-900 mb-1">
                📌 Sabit Oda Anahtarı Modeli Aktif
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                Bu QR kod odadaki misafir değişse bile <b>hiç değişmez</b>. Odanın içine bir kez asmanız yeterlidir.
                Sistem odaya giriş yapan misafiri otomatik tanır.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kalıcı QR Kod URL (Oda İçin)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={`${baseURL}/guest/${showCustomInput ? (selectedCustomRoom || '...') : (selectedRoom || '...')}`}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                />
                <button
                  onClick={() => {
                    const url = `${baseURL}/guest/${showCustomInput ? selectedCustomRoom : selectedRoom}`;
                    navigator.clipboard.writeText(url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-4 py-3 bg-hotel-gold text-white rounded-lg hover:bg-hotel-navy transition-colors flex items-center space-x-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm font-medium">Kopyala</span>
                </button>
              </div>
            </div>

            {qrCodeURL && qrCodeURL.includes('?g=') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-blue-900 mb-2">
                  ✨ Misafire Özel Link (WhatsApp/Dijital)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={qrCodeURL}
                    readOnly
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-lg bg-white text-xs font-mono text-blue-700"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(qrCodeURL);
                      alert('Özel link kopyalandı! Bu linki misafire dijital olarak gönderebilirsiniz.');
                    }}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    title="Özel Linki Kopyala"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setQRCodeURL('')}
                    className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                    title="Görünümü Temizle"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-blue-600 mt-2">
                  * Bu link sadece bu misafire özeldir ve check-out tarihinde iptal olur.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                {getTranslation('qr.print')}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                {getTranslation('qr.download')}
              </button>

              {showCustomInput && customRooms.length > 1 && (
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {getTranslation('qr.download_all_btn')} ({customRooms.length})
                </button>
              )}
              {!showCustomInput && (
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {getTranslation('qr.download_all_btn')} ({(useGeneratedRooms ? generatedRooms : rooms).length})
                </button>
              )}
            </div>
          </div>

          {/* Right Side - QR Preview */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 border-2 border-dashed border-gray-300">
            <div className="bg-white p-6 rounded-2xl shadow-2xl mb-6">
              <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-xl">
                {qrCodeURL || `${baseURL}/guest/${showCustomInput ? selectedCustomRoom : selectedRoom}` ? (
                  <QRCode
                    value={qrCodeURL || `${baseURL}/guest/${showCustomInput ? selectedCustomRoom : selectedRoom}`}
                    size={192}
                    level="M"
                    includeMargin={true}
                    renderAs="svg"
                    className="qr-code-svg"
                  />
                ) : (
                  <QrCode className="w-48 h-48 text-gray-400" />
                )}
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Oda {showCustomInput ? (selectedCustomRoom || '...') : (selectedRoom || '...')}
              </h3>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-3">
                Kalıcı QR (Sabit Link)
              </div>
              <p className="text-sm text-gray-600">
                Bu kodu odadaki masaya veya duvara asabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="hotel-card p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-3">QR Kod Kullanım Talimatları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-hotel-gold text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">1</span>
                  <span>Her oda için benzersiz QR kod oluşturulur</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-hotel-gold text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">2</span>
                  <span>Misafirler QR kodu tarayarak doğrudan oda menüsüne erişir</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-hotel-gold text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">3</span>
                  <span>QR kodu yazdırıp oda içine yerleştirebilirsiniz</span>
                </li>
              </ul>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-hotel-gold text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">4</span>
                  <span>Tüm odalar için toplu QR kod oluşturabilirsiniz</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-hotel-gold text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">5</span>
                  <span>QR kodlar kalıcıdır, yeniden oluşturmanıza gerek yoktur</span>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-hotel-gold text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">6</span>
                  <span>Misafirler telefonları ile QR kodu okutarak sipariş verebilir</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Room Grid */}
      {!showCustomInput && !isLoading && (useGeneratedRooms ? generatedRooms : rooms).length > 0 && (
        <div className="hotel-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Hızlı Oda Seçimi</h3>
            <div className="text-sm text-gray-500">
              {(useGeneratedRooms ? generatedRooms : rooms).length} oda
            </div>
          </div>

          {/* Kat bazında gruplandırma */}
          {Array.from(new Set((useGeneratedRooms ? generatedRooms : rooms).map((r: any) => r.floor))).sort((a: any, b: any) => a - b).map((floorNumber: any) => {
            const floorRooms = (useGeneratedRooms ? generatedRooms : rooms).filter((room: any) => room.floor === floorNumber);

            return (
              <div key={floorNumber} className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {floorNumber}. Kat ({floorRooms.length} oda)
                </h4>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {floorRooms.map((room: any) => (
                    <button
                      key={room.number}
                      onClick={() => {
                        const activeGuest = room.guests && room.guests.length > 0 ? room.guests[0] : null;
                        setRoomToSelect(room.number);
                        if (activeGuest) {
                          setGuestNameInput(`${activeGuest.firstName} ${activeGuest.lastName}`);
                          setGuestCheckIn(activeGuest.checkIn ? new Date(activeGuest.checkIn).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
                        } else {
                          setGuestNameInput('');
                          setGuestCheckIn(new Date().toISOString().split('T')[0]);
                        }
                        setShowGuestModal(true);
                      }}
                      className={`p-2 rounded-lg border-2 transition-all text-xs ${selectedRoom === room.number
                        ? 'border-hotel-gold bg-hotel-gold text-white'
                        : 'border-gray-200 hover:border-hotel-gold hover:bg-gray-50'
                        }`}
                    >
                      <div className="font-bold">{room.number}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Misafir adı modal - Hızlı oda seçiminde açılır */}
      {showGuestModal && roomToSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Oda {roomToSelect} – Misafir Adı</h3>
              <button onClick={() => { setShowGuestModal(false); setRoomToSelect(null); }} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Misafir bilgilerini doğrulayın. Bu bilgiler QR kodun içine (token bazlı) gömülecektir. Yeni bir misafir geldiğinde yeni tarihli bir QR kod üretmeniz önerilir.</p>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Misafir Ad Soyad</label>
                <input
                  type="text"
                  value={guestNameInput}
                  onChange={(e) => setGuestNameInput(e.target.value)}
                  placeholder="Örn: Leyla Yılmaz"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Check-in Tarihi</label>
                  <input
                    type="date"
                    value={guestCheckIn}
                    onChange={(e) => setGuestCheckIn(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Check-out (Opsiyonel)</label>
                  <input
                    type="date"
                    value={guestCheckOut}
                    onChange={(e) => setGuestCheckOut(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowGuestModal(false); setRoomToSelect(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={guestTokenLoading}
              >
                İptal
              </button>
              <button
                onClick={async () => {
                  setSelectedRoom(roomToSelect);
                  const name = guestNameInput.trim();
                  if (!name) {
                    setQRCodeURL(`${baseURL}/guest/${roomToSelect}`);
                    setShowGuestModal(false);
                    setRoomToSelect(null);
                    return;
                  }
                  setGuestTokenLoading(true);
                  try {
                    const tenant = (() => {
                      const h = window.location.hostname.split('.')[0];
                      return h && h !== 'www' && h !== 'roomxqr' && h !== 'roomxqr-backend' ? h : 'demo';
                    })();

                    const r = await fetch('/api/guest-token', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'x-tenant': tenant },
                      body: JSON.stringify({
                        roomId: roomToSelect,
                        guestName: name,
                        checkIn: guestCheckIn,
                        checkOut: guestCheckOut || null
                      })
                    });

                    const d = await r.json().catch(() => ({}));
                    if (d.token) {
                      setQRCodeURL(`${baseURL}/guest/${roomToSelect}?g=${encodeURIComponent(d.token)}`);
                    } else {
                      setQRCodeURL(`${baseURL}/guest/${roomToSelect}?guest=${encodeURIComponent(name)}`);
                    }
                  } catch (err) {
                    setQRCodeURL(`${baseURL}/guest/${roomToSelect}?guest=${encodeURIComponent(name)}`);
                  }
                  setGuestTokenLoading(false);
                  setShowGuestModal(false);
                  setRoomToSelect(null);
                }}
                className="px-4 py-2 bg-hotel-gold text-white rounded-lg hover:bg-hotel-navy disabled:opacity-50 font-medium"
                disabled={guestTokenLoading}
              >
                {guestTokenLoading ? '...' : 'QR Kod Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

