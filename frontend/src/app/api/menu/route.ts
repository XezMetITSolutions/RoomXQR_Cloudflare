import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';

async function loadFallbackMenu() {
  try {
    const menuData = await fs.readFile(MENU_FILE, 'utf8');
    const parsed = JSON.parse(menuData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Fallback menu okunamadı:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    // Tenant bilgisini al
    let tenantSlug = request.headers.get('x-tenant') || '';

    // Eğer header'da yoksa, host header'ından subdomain'i çıkar
    if (!tenantSlug) {
      const host = request.headers.get('host') || '';
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend' && subdomain !== 'localhost') {
        tenantSlug = subdomain;
      } else {
        // Varsayılan tenant
        tenantSlug = 'demo';
      }
    }

    // Önce backend'den menüyü yüklemeyi dene
    try {
      const backendHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-tenant': tenantSlug,
      };

      const backendResponse = await fetch(`${BACKEND_URL}/api/menu`, {
        method: 'GET',
        headers: backendHeaders,
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        console.log('Backend\'den gelen menu data:', {
          hasMenuItems: !!backendData.menuItems,
          hasMenu: !!backendData.menu,
          menuItemsCount: backendData.menuItems?.length || 0,
          menuCount: backendData.menu?.length || 0
        });
        // Backend'den gelen formatı frontend formatına çevir
        // Backend hem menuItems hem de menu döndürebilir
        const menuItems = backendData.menuItems || backendData.menu || [];
        console.log('Parse edilen menu items sayısı:', menuItems.length);
        const menu = menuItems.map((item: any) => {
          // Translations'ı parse et
          let translations = {};
          try {
            if (item.translations) {
              if (typeof item.translations === 'string') {
                translations = JSON.parse(item.translations);
              } else if (typeof item.translations === 'object') {
                translations = item.translations;
              }
            }
          } catch (parseError) {
            console.warn(`Translation parse error for item ${item.id}:`, parseError);
            translations = {};
          }

          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: parseFloat(item.price) || 0,
            category: item.category || 'Diğer',
            image: item.image || '',
            allergens: item.allergens || [],
            calories: item.calories,
            preparationTime: item.preparationTime || 15,
            rating: item.rating || 4.0,
            available: item.isAvailable !== false,
            translations: translations,
          };
        });

        console.log('Frontend\'e döndürülen menu sayısı:', menu.length);

        if (menu.length > 0) {
          return NextResponse.json({ menu, source: 'backend' }, { status: 200 });
        }

        // Backend boş döndüyse boş döndür (demo verisine düşme)
        return NextResponse.json({ menu: [], source: 'backend_empty' }, { status: 200 });
      }
    } catch (backendError) {
      console.warn('Backend menu yükleme hatası, client-side dosyaya geçiliyor:', backendError);
    }

    // Backend'den yüklenemezse, client-side dosyadan oku
    try {
      const menu = await loadFallbackMenu();
      return NextResponse.json({ menu, source: 'local_fallback_error' }, { status: 200 });
    } catch (error) {
      // Dosya yoksa boş menü döndür
      return NextResponse.json({ menu: [] }, { status: 200 });
    }
  } catch (error) {
    console.error('Menu API hatası:', error);
    return NextResponse.json({ menu: [] }, { status: 200 });
  }
}
