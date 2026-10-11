const fs = require('fs');
const path = require('path');

const dataJsPath = path.join(__dirname, '../js/data.js');
let content = fs.readFileSync(dataJsPath, 'utf8');

// 1. Update INITIAL_ASSET_TYPES
content = content.replace(
  "defaultBrand: 'Daikin / Panasonic'",
  "defaultBrand: 'Daikin 1.5 HP'"
);
content = content.replace(
  "defaultBrand: 'Toshiba / Aqua 180L'",
  "defaultBrand: 'Toshiba 180L'"
);
content = content.replace(
  "defaultBrand: 'Khung gỗ sồi + Nệm cao su 1m6'",
  "defaultBrand: 'Việt Á Luxury 1m6'"
);
content = content.replace(
  "defaultBrand: 'Gỗ MDF chống ẩm 2 cánh'",
  "defaultBrand: 'An Cường MDF 2 cánh'"
);
content = content.replace(
  "defaultBrand: 'Bàn gỗ 1m2 + Ghế xoay'",
  "defaultBrand: 'Hòa Phát Ergonomic'"
);
content = content.replace(
  "defaultBrand: 'Khóa từ vân tay Kaadas'",
  "defaultBrand: 'Kaadas K9'"
);

// 2. Room P101 Assets in INITIAL_ASSETS
// Name of AC
content = content.replace(
  "id: 'ast-ac-101',\n    code: 'AC-CENTRAL-101',\n    typeCode: 'AC',\n    typeName: 'Điều hòa không khí',\n    name: 'Điều hòa Daikin Inverter 1.5 HP',",
  "id: 'ast-ac-101',\n    code: 'AC-CENTRAL-101',\n    typeCode: 'AC',\n    typeName: 'Điều hòa không khí',\n    name: 'Điều hòa Inverter Daikin 1.5 HP',"
);
// Fridge Panasonic -> Toshiba
content = content.replace(
  "id: 'ast-fridge-101',\n    code: 'FRIDGE-CENTRAL-101',\n    typeCode: 'FRIDGE',\n    typeName: 'Tủ lạnh',\n    name: 'Tủ lạnh Panasonic Inverter 188L',\n    brand: 'Panasonic',\n    model: 'NR-BA229PKVN',\n    price: 6200000,",
  "id: 'ast-fridge-101',\n    code: 'FRIDGE-CENTRAL-101',\n    typeCode: 'FRIDGE',\n    typeName: 'Tủ lạnh',\n    name: 'Tủ lạnh Toshiba Inverter 180L',\n    brand: 'Toshiba',\n    model: 'GR-B22VU(UKG)',\n    price: 5800000,"
);

// 3. Room P102 Assets in INITIAL_ASSETS
// AC Casper -> Daikin
content = content.replace(
  "id: 'ast-ac-102',\n    code: 'AC-CENTRAL-102',\n    typeCode: 'AC',\n    typeName: 'Điều hòa không khí',\n    name: 'Điều hòa Casper Inverter 1.0 HP',\n    brand: 'Casper',\n    model: 'GC-09IS33',\n    price: 7500000,",
  "id: 'ast-ac-102',\n    code: 'AC-CENTRAL-102',\n    typeCode: 'AC',\n    typeName: 'Điều hòa không khí',\n    name: 'Điều hòa Inverter Daikin 1.5 HP',\n    brand: 'Daikin',\n    model: 'FTKQ35SVMV',\n    price: 11500000,"
);
// Fridge model standard
content = content.replace(
  "id: 'ast-fridge-102',\n    code: 'FRIDGE-CENTRAL-102',\n    typeCode: 'FRIDGE',\n    typeName: 'Tủ lạnh',\n    name: 'Tủ lạnh Toshiba Inverter 180L',\n    brand: 'Toshiba',\n    model: 'GR-B22VU',",
  "id: 'ast-fridge-102',\n    code: 'FRIDGE-CENTRAL-102',\n    typeCode: 'FRIDGE',\n    typeName: 'Tủ lạnh',\n    name: 'Tủ lạnh Toshiba Inverter 180L',\n    brand: 'Toshiba',\n    model: 'GR-B22VU(UKG)',"
);
// Washing machine name
content = content.replace(
  "name: 'Máy giặt Electrolux 8.5kg',",
  "name: 'Máy giặt Electrolux UltimateCare 8.5kg',"
);

// 4. Room P104 Assets in INITIAL_ASSETS
content = content.replace(
  "id: 'ast-ac-104',\n    code: 'AC-CENTRAL-104',\n    typeCode: 'AC',\n    typeName: 'Điều hòa không khí',\n    name: 'Điều hòa Daikin Inverter 1.5 HP',",
  "id: 'ast-ac-104',\n    code: 'AC-CENTRAL-104',\n    typeCode: 'AC',\n    typeName: 'Điều hòa không khí',\n    name: 'Điều hòa Inverter Daikin 1.5 HP',"
);
// Fridge Sharp -> Toshiba
content = content.replace(
  "id: 'ast-fridge-104',\n    code: 'FRIDGE-CENTRAL-104',\n    typeCode: 'FRIDGE',\n    typeName: 'Tủ lạnh',\n    name: 'Tủ lạnh Sharp 165L',\n    brand: 'Sharp',\n    model: 'SJ-X176E-SL',\n    price: 5100000,",
  "id: 'ast-fridge-104',\n    code: 'FRIDGE-CENTRAL-104',\n    typeCode: 'FRIDGE',\n    typeName: 'Tủ lạnh',\n    name: 'Tủ lạnh Toshiba Inverter 180L',\n    brand: 'Toshiba',\n    model: 'GR-B22VU(UKG)',\n    price: 5800000,"
);

// 5. In-stock Assets in INITIAL_ASSETS
// AC Panasonic -> Daikin
content = content.replace(
  "name: 'Điều hòa Panasonic Inverter 1.5 HP (Dự phòng)',\n    brand: 'Panasonic',\n    model: 'XPU12XKH-8',\n    price: 12200000,",
  "name: 'Điều hòa Inverter Daikin 1.5 HP (Dự phòng)',\n    brand: 'Daikin',\n    model: 'FTKQ35SVMV',\n    price: 11500000,"
);
// Fridge Aqua -> Toshiba
content = content.replace(
  "name: 'Tủ lạnh Aqua 180L AQR-T220FA (Dự phòng)',\n    brand: 'Aqua',\n    model: 'AQR-T220FA',\n    price: 5200000,",
  "name: 'Tủ lạnh Toshiba Inverter 180L (Dự phòng)',\n    brand: 'Toshiba',\n    model: 'GR-B22VU(UKG)',\n    price: 5800000,"
);
// Water heater Rossi -> Ariston
content = content.replace(
  "name: 'Bình nóng lạnh Rossi 30L Arte (Dự phòng)',\n    brand: 'Rossi',\n    model: 'Arte 30SQ',\n    price: 2900000,\n    purchaseDate: '2026-03-01',\n    warrantyMonths: 24,",
  "name: 'Bình nóng lạnh Ariston 30L chống giật (Dự phòng)',\n    brand: 'Ariston',\n    model: 'AN2 30 LUX',\n    price: 3600000,\n    purchaseDate: '2026-03-01',\n    warrantyMonths: 36,"
);

// 6. Amenities standardization in INITIAL_ROOMS
content = content.replace(/'Điều hòa Casper'/g, "'Điều hòa Daikin'");
content = content.replace(/'Tủ lạnh Sharp'/g, "'Tủ lạnh Toshiba 180L'");
content = content.replace(/'Tủ lạnh Samsung 208L'/g, "'Tủ lạnh Toshiba 180L'");
content = content.replace(/'Bình nóng lạnh Rossi'/g, "'Bình nóng lạnh Ariston'");

// 7. Add migrateUniformAssetBrands to DataStore
if (!content.includes('migrateUniformAssetBrands()')) {
  const initCallIndex = content.indexOf('this.migrateResidentDemoInvoices();');
  if (initCallIndex !== -1) {
    content = content.replace(
      'this.migrateResidentDemoInvoices();',
      'this.migrateResidentDemoInvoices();\n    this.migrateUniformAssetBrands();'
    );
  }

  const methodInsertionPoint = content.indexOf('migrateResidentDemoInvoices() {');
  if (methodInsertionPoint !== -1) {
    const migrationCode = `migrateUniformAssetBrands() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ASSETS);
      if (!raw) return;
      let assets = JSON.parse(raw);
      let changed = false;

      assets = assets.map(a => {
        if (a.typeCode === 'AC') {
          if (a.brand !== 'Daikin' || !a.name.includes('Daikin') || a.model !== 'FTKQ35SVMV') {
            changed = true;
            return {
              ...a,
              brand: 'Daikin',
              name: 'Điều hòa Inverter Daikin 1.5 HP',
              model: 'FTKQ35SVMV',
              price: 11500000,
              warrantyMonths: 24
            };
          }
        } else if (a.typeCode === 'FRIDGE') {
          if (a.brand !== 'Toshiba' || !a.name.includes('Toshiba') || a.model !== 'GR-B22VU(UKG)') {
            changed = true;
            return {
              ...a,
              brand: 'Toshiba',
              name: 'Tủ lạnh Toshiba Inverter 180L',
              model: 'GR-B22VU(UKG)',
              price: 5800000,
              warrantyMonths: 24
            };
          }
        } else if (a.typeCode === 'WATER_HEATER') {
          if (a.brand !== 'Ariston' || !a.name.includes('Ariston') || a.model !== 'AN2 30 LUX') {
            changed = true;
            return {
              ...a,
              brand: 'Ariston',
              name: 'Bình nóng lạnh Ariston 30L chống giật',
              model: 'AN2 30 LUX',
              price: 3600000,
              warrantyMonths: 36
            };
          }
        } else if (a.typeCode === 'BED') {
          if (a.brand !== 'Việt Á Luxury') {
            changed = true;
            return {
              ...a,
              brand: 'Việt Á Luxury',
              name: 'Giường nệm cao su non 1m6x2m',
              model: 'VA-1620',
              price: 7200000,
              warrantyMonths: 36
            };
          }
        } else if (a.typeCode === 'WASHING_MACHINE') {
          if (a.brand !== 'Electrolux') {
            changed = true;
            return {
              ...a,
              brand: 'Electrolux',
              name: 'Máy giặt Electrolux UltimateCare 8.5kg',
              model: 'EWF85743',
              price: 8900000,
              warrantyMonths: 24
            };
          }
        }
        return a;
      });

      if (changed) {
        localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
      }
    } catch (e) {
      console.warn('migrateUniformAssetBrands error:', e);
    }
  },\n\n  `;
    content = content.replace('migrateResidentDemoInvoices() {', migrationCode + 'migrateResidentDemoInvoices() {');
  }
}

fs.writeFileSync(dataJsPath, content, 'utf8');
console.log('Successfully updated uniform asset data in js/data.js!');
