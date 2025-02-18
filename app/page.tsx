"use client"; // ใช้ Client Component

import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import Select from "react-select";
import * as XLSX from "xlsx";

// ✅ กำหนดประเภทของข้อมูล
interface CarData {
  "Series Name": string;
  "ประเภทรถยนต์": string;
  "รุ่น": string;
  "สีภาษาไทย"?: string;
  "ขนาดเครื่องยนต์ (ซีซี)"?: number;
  "กำลังมอเตอร์ไฟฟ้า (กิโลวัตต์)"?: number;
  "ประเภทของแบตเตอรี่"?: string;
  "ขนาดความจุแบตเตอรี่ (แอมแปร์-ชั่วโมง)"?: number;
  "Model": string;
}

interface SelectOption {
  value: string;
  label: string;
}

export default function Home() {
  const [data, setData] = useState<CarData[]>([]);
  const [filteredData, setFilteredData] = useState<CarData[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<SelectOption | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<SelectOption | null>(null);
  const [selectedColor, setSelectedColor] = useState<SelectOption | null>(null);
  const [isClient, setIsClient] = useState(false);

  const filePath = "/Series Current Sales Fill Thai Name as of 03022025.xlsx";

  // ✅ ป้องกัน SSR Error
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ โหลดข้อมูลจาก Excel
  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        const response = await fetch(filePath);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = (e) => {
          const arrayBuffer = e.target?.result;
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData: CarData[] = XLSX.utils.sheet_to_json(sheet);

          setData(jsonData);
          setFilteredData(jsonData);
        };

        reader.readAsArrayBuffer(blob);
      } catch (error) {
        console.error("❌ Error fetching Excel data:", error);
      }
    };

    fetchExcelData();
  }, []);

  // ✅ ฟังก์ชันกรองข้อมูล
  useEffect(() => {
    let filtered = [...data];

    if (selectedSeries?.value) {
      filtered = filtered.filter((row) => row["Series Name"]?.trim() === selectedSeries.value.trim());
    }

    if (selectedGrade?.value) {
      filtered = filtered.filter((row) => row["รุ่น"]?.trim() === selectedGrade.value.trim());
    }

    if (selectedColor?.value) {
      filtered = filtered.filter((row) => row["สีภาษาไทย"]?.trim() === selectedColor.value.trim());
    }

    setFilteredData(filtered);
  }, [selectedSeries, selectedGrade, selectedColor, data]);

  // ✅ ฟังก์ชันรีเซ็ตตัวกรอง
  const handleClearFilters = () => {
    setSelectedSeries(null);
    setSelectedGrade(null);
    setSelectedColor(null);
    setFilteredData(data);
  };

  // ✅ คอลัมน์ของ DataTable
  const columns: TableColumn<CarData>[] = [
    { name: "Series Name", selector: (row) => row["Series Name"], sortable: true, style: { minWidth: "150px" } },
    { name: "ประเภท รถยนต์", selector: (row) => row["ประเภทรถยนต์"], sortable: true, style: { minWidth: "150px" } },
    { name: "รุ่น", selector: (row) => row["รุ่น"], sortable: true, style: { minWidth: "300px" } },
    { name: "สี", selector: (row) => row["สีภาษาไทย"] ?? "N/A", sortable: true, style: { minWidth: "200px" } },
    { name: "ขนาดเครื่องยนต์", selector: (row) => row["ขนาดเครื่องยนต์ (ซีซี)"] ?? "N/A", sortable: true },
    { name: "กำลังมอเตอร์ไฟฟ้า", selector: (row) => row["กำลังมอเตอร์ไฟฟ้า (กิโลวัตต์)"] ?? "N/A", sortable: true },
    { name: "ประเภทของแบตเตอรี่", selector: (row) => row["ประเภทของแบตเตอรี่"] ?? "N/A", sortable: true },
    { name: "ขนาดความจุแบตเตอรี่", selector: (row) => row["ขนาดความจุแบตเตอรี่ (แอมแปร์-ชั่วโมง)"] ?? "N/A", sortable: true },
    { name: "เลข Model", selector: (row) => row["Model"], sortable: true, style: { minWidth: "150px" } },
  ];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">ตารางข้อมูลรถยนต์ + ตัวกรอง</h1>

      {isClient && (
        <div className="flex gap-4 mb-4">
          <Select
            options={Array.from(new Set(data.map((row) => row["Series Name"])))
              .filter(Boolean)
              .map((name) => ({ value: name.trim(), label: name.trim() }))}
            value={selectedSeries}
            onChange={setSelectedSeries}
            isClearable
            placeholder="เลือก Series Name"
            className="w-1/4"
          />

          <Select
            options={Array.from(new Set(data.map((row) => row["รุ่น"])))
              .filter(Boolean)
              .map((name) => ({ value: name.trim(), label: name.trim() }))}
            value={selectedGrade}
            onChange={setSelectedGrade}
            isClearable
            placeholder="เลือก Grade Name"
            className="w-1/4"
          />

<Select
  options={Array.from(new Set(data.map((row) => row["สีภาษาไทย"])))
    .filter(Boolean)
    .map((name) => ({ value: name?.trim() || "", label: name?.trim() || "" }))} // ✅ แก้ไขตรงนี้
  value={selectedColor}
  onChange={setSelectedColor}
  isClearable
  placeholder="เลือก Color Name"
  className="w-1/4"
/>

          <button
            onClick={handleClearFilters}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
          >
            เคลียร์ตัวกรอง
          </button>
        </div>
      )}

      <DataTable columns={columns} data={filteredData} pagination />
    </main>
  );
}
