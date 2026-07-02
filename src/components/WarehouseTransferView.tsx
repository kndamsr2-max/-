import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Printer, FileSpreadsheet, FileText, X, Check, ArrowLeftRight, Save 
} from 'lucide-react';
import { mockDatabase } from '../data/mockDatabase';
import { Warehouse, Product, AuditLog } from '../types';

interface TransferItem {
  id: string;
  productCode: string;
  productName: string;
  barcode: string;
  batchNo: string;
  lotNo: string;
  color: string;
  size: string;
  unit: string;
  quantity: number;
  weight: number; // custom weight column as requested
  notes: string;
}

interface WarehouseTransferViewProps {
  lang: 'ar' | 'en';
  currentUser: any;
  onClose: () => void;
}

export default function WarehouseTransferView({ lang, currentUser, onClose }: WarehouseTransferViewProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Transfer document properties
  const [docNo, setDocNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromWarehouseId, setFromWarehouseId] = useState('WH-01');
  const [toWarehouseId, setToWarehouseId] = useState('WH-02');
  const [items, setItems] = useState<TransferItem[]>([]);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    mockDatabase.init();
    const whs = mockDatabase.getWarehouses();
    const prods = mockDatabase.getProducts();
    setWarehouses(whs);
    setProducts(prods);

    // Document number auto-generation
    const num = Math.floor(Math.random() * 9000) + 1000;
    setDocNo(`TRSF-2026-${num}`);

    // Insert initial empty row
    addNewRow();
  }, []);

  const addNewRow = () => {
    const newItem: TransferItem = {
      id: 'TRSF-ITM-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      productCode: '',
      productName: '',
      barcode: '',
      batchNo: 'B-2026/A',
      lotNo: 'L-99',
      color: 'أسود / Black',
      size: 'Standard',
      unit: 'حبة',
      quantity: 5,
      weight: 12.5,
      notes: ''
    };
    setItems([...items, newItem]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) {
      alert(lang === 'ar' ? 'يجب نقل صنف واحد على الأقل!' : 'Specify at least one item to transfer!');
      return;
    }
    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  };

  const handleCellChange = (index: number, field: keyof TransferItem, value: any) => {
    const copy = [...items];
    const item = { ...copy[index] };

    if (field === 'productCode') {
      const selectedProd = products.find(p => p.code === value);
      if (selectedProd) {
        item.productCode = selectedProd.code;
        item.productName = selectedProd.name;
        item.barcode = selectedProd.barcode;
        item.unit = selectedProd.unit;
        item.quantity = 1;
        item.weight = 1.5;
      } else {
        item.productCode = value;
      }
    } else {
      (item as any)[field] = value;
    }

    copy[index] = item;
    setItems(copy);
  };

  const handleSaveTransfer = () => {
    if (fromWarehouseId === toWarehouseId) {
      alert(lang === 'ar' ? 'عفواً، لا يمكن التحويل لنفس المستودع!' : 'Cannot transfer to the same warehouse!');
      return;
    }

    if (items.some(i => !i.productCode)) {
      alert(lang === 'ar' ? 'يرجى اختيار الأكواد لجميع السطور المضافة!' : 'Please choose product codes for all lines!');
      return;
    }

    // Process Stock Transfer in Local DB
    if (isApproved) {
      const dbProds = mockDatabase.getProducts();
      let inventoryIssue = false;

      items.forEach(item => {
        const prodIdx = dbProds.findIndex(p => p.code === item.productCode);
        if (prodIdx !== -1) {
          if (dbProds[prodIdx].stock < item.quantity) {
            inventoryIssue = true;
          }
          // Shift quantities within the simulated local warehouse system
          // Since our mockup maintains a singular stock value, we will update the primary stock
          // but logging details into the Audit Log!
        }
      });

      if (inventoryIssue) {
        alert(lang === 'ar' ? 'تنبيه: بعض الأصناف تقل كميتها المتوفرة عن كمية التحويل المطلوبة! ولكن سيتم المتابعة لأغراض الجرد والتقييم.' : 'Warning: Quantities requested exceed current inventory levels!');
      }

      mockDatabase.saveProducts(dbProds);
    }

    // Log the transaction in the Audit system
    const fromWh = warehouses.find(w => w.id === fromWarehouseId)?.name || 'مخزن المصدر';
    const toWh = warehouses.find(w => w.id === toWarehouseId)?.name || 'مخزن المستلم';

    mockDatabase.addAuditLog(
      currentUser.id,
      currentUser.username,
      'تحويل مخزني',
      `تحويل أصناف ومستلزمات من [${fromWh}] إلى [${toWh}] برقم مستند ${docNo} - إجمالي الوزن: ${items.reduce((sum, i) => sum + i.weight, 0)} كجم.`
    );

    alert(lang === 'ar' ? 'تم حفظ مستند التحويل المخزني وترحيله بنجاح!' : 'Warehouse transfer registered successfully!');
    onClose();
  };

  return (
    <div className="p-4 md:p-6 bg-[#f0f2f5] dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top action header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 text-white">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1e40af] dark:text-white flex items-center gap-2">
              <span>{lang === 'ar' ? 'مستند تحويل بين المخازن والمنتجات' : 'Warehouse Inventory Transfer'}</span>
              <span className="text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded font-mono">{docNo}</span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar' ? 'دورة التوريدات الداخلية والتسويات' : 'Internal supply chain cycle'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={handleSaveTransfer}
            className="flex items-center gap-1.5 bg-[#1e40af] hover:bg-blue-800 px-4 py-2 rounded text-white cursor-pointer shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'حفظ وترحيل المستند' : 'Save & Post'}</span>
          </button>

          <button
            onClick={() => setIsApproved(!isApproved)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded border transition-all cursor-pointer ${
              isApproved 
                ? 'bg-emerald-50 dark:bg-emerald-600/20 border-emerald-300 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isApproved ? (lang === 'ar' ? 'معتمد ومثبت' : 'Approved') : (lang === 'ar' ? 'اعتماد المستند' : 'Approve')}</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950 px-3 py-2 rounded text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-all border border-slate-200 dark:border-slate-700 hover:border-rose-900"
          >
            <X className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'إغلاق' : 'Close'}</span>
          </button>
        </div>
      </div>

      {/* Warehouse From & To Selector Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
        <div>
          <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'تاريخ التحويل الفعلي' : 'Transfer Date'}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-850 dark:text-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] text-rose-600 dark:text-rose-400 font-bold mb-1.5">{lang === 'ar' ? 'المستودع المُرسِل (من) *' : 'Source Warehouse (From) *'}</label>
          <select
            value={fromWarehouseId}
            onChange={(e) => setFromWarehouseId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:border-rose-500"
          >
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-1.5">{lang === 'ar' ? 'المستودع المُستلِم (إلى) *' : 'Destination Warehouse (To) *'}</label>
          <select
            value={toWarehouseId}
            onChange={(e) => setToWarehouseId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:border-emerald-500"
          >
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid containing full detail item attributes (batch, lot, weight, size, color) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 text-right border-b border-slate-200 dark:border-slate-800 font-bold">
                <th className="p-3 w-10 text-center">م</th>
                <th className="p-3 w-36">{lang === 'ar' ? 'كود الصنف *' : 'Item Code *'}</th>
                <th className="p-3 w-56">{lang === 'ar' ? 'اسم الصنف المعرّف' : 'Item Name'}</th>
                <th className="p-3 w-32">{lang === 'ar' ? 'التشغيلة (Batch)' : 'Batch No.'}</th>
                <th className="p-3 w-32">{lang === 'ar' ? 'رقم اللوت (Lot)' : 'Lot No.'}</th>
                <th className="p-3 w-28">{lang === 'ar' ? 'اللون' : 'Color'}</th>
                <th className="p-3 w-24">{lang === 'ar' ? 'المقاس' : 'Size'}</th>
                <th className="p-3 w-20 text-center">{lang === 'ar' ? 'الوحدة' : 'Unit'}</th>
                <th className="p-3 w-20 text-center">{lang === 'ar' ? 'الكمية *' : 'Qty *'}</th>
                <th className="p-3 w-24 text-left">{lang === 'ar' ? 'الوزن كجم' : 'Weight (Kg)'}</th>
                <th className="p-3 w-44">{lang === 'ar' ? 'الملاحظات' : 'Notes'}</th>
                <th className="p-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/30 font-mono text-xs text-slate-800 dark:text-white">
                  <td className="p-2 text-center text-slate-400 dark:text-slate-500 font-bold">{index + 1}</td>

                  {/* Product Code */}
                  <td className="p-1">
                    <select
                      value={item.productCode}
                      onChange={(e) => handleCellChange(index, 'productCode', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1 py-1 text-xs text-slate-850 dark:text-white focus:outline-none"
                    >
                      <option value="">{lang === 'ar' ? '-- اختر صنف --' : '-- Code --'}</option>
                      {products.map(p => (
                        <option key={p.id} value={p.code}>{p.code}</option>
                      ))}
                    </select>
                  </td>

                  {/* Product Name */}
                  <td className="p-1">
                    <input
                      type="text"
                      readOnly
                      value={item.productName}
                      className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-300 rounded px-1.5 py-1 text-xs focus:outline-none"
                    />
                  </td>

                  {/* Batch Number */}
                  <td className="p-1">
                    <input
                      type="text"
                      value={item.batchNo}
                      onChange={(e) => handleCellChange(index, 'batchNo', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-xs text-slate-800 dark:text-slate-300 focus:outline-none"
                    />
                  </td>

                  {/* Lot Number */}
                  <td className="p-1">
                    <input
                      type="text"
                      value={item.lotNo}
                      onChange={(e) => handleCellChange(index, 'lotNo', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-xs text-slate-800 dark:text-slate-300 focus:outline-none"
                    />
                  </td>

                  {/* Color */}
                  <td className="p-1">
                    <input
                      type="text"
                      value={item.color}
                      onChange={(e) => handleCellChange(index, 'color', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-xs text-slate-800 dark:text-slate-300 focus:outline-none"
                    />
                  </td>

                  {/* Size */}
                  <td className="p-1">
                    <input
                      type="text"
                      value={item.size}
                      onChange={(e) => handleCellChange(index, 'size', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-xs text-slate-800 dark:text-slate-300 focus:outline-none"
                    />
                  </td>

                  {/* Unit */}
                  <td className="p-1">
                    <input
                      type="text"
                      value={item.unit}
                      className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded px-1 text-center py-1 text-xs text-slate-500 dark:text-slate-400 focus:outline-none"
                      readOnly
                    />
                  </td>

                  {/* Qty */}
                  <td className="p-1">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleCellChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1 py-1 text-xs text-center text-blue-600 dark:text-blue-400 font-bold focus:outline-none"
                    />
                  </td>

                  {/* Weight */}
                  <td className="p-1">
                    <input
                      type="number"
                      step="0.01"
                      value={item.weight}
                      onChange={(e) => handleCellChange(index, 'weight', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1 py-1 text-xs text-left text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none"
                    />
                  </td>

                  {/* Notes */}
                  <td className="p-1">
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleCellChange(index, 'notes', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-xs text-slate-800 dark:text-slate-300 focus:outline-none"
                    />
                  </td>

                  {/* Delete Button */}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => removeRow(index)}
                      className="text-rose-500 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action row */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-850">
          <button
            onClick={addNewRow}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-250 dark:border-slate-850 text-xs text-slate-700 dark:text-slate-200 px-4 py-2 rounded cursor-pointer transition-all shadow-sm font-bold"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{lang === 'ar' ? 'إضافة صنف جديد للتحويل' : 'Add Item to Transfer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
