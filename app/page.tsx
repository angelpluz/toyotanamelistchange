"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import * as XLSX from "xlsx";
import { StylesConfig } from "react-select";
// ✅ ตรวจจับ Mobile Mode
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query, matches]);

  return matches;
};

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
  const [seriesOptions, setSeriesOptions] = useState<SelectOption[]>([]);
  const [gradeOptions, setGradeOptions] = useState<SelectOption[]>([]);
  const [colorOptions, setColorOptions] = useState<SelectOption[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<SelectOption | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<SelectOption | null>(null);
  const [selectedColor, setSelectedColor] = useState<SelectOption | null>(null);
  const [isClient, setIsClient] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)"); // ตรวจจับหน้าจอขนาดเล็ก

  const filePath = "/Series Current Sales Fill Thai Name as of 03022025.xlsx";

  // ✅ กำหนดสีของ select บน Android
  const customSelectStyles: StylesConfig<SelectOption, false> = {
    control: (styles) => ({
      ...styles,
      backgroundColor: "white",
      color: "black",
      borderColor: "#ccc",
      "&:hover": { borderColor: "#888" },
      boxShadow: "none",
    }),
    singleValue: (styles) => ({
      ...styles,
      color: "black",
    }),
    option: (styles, { isSelected }) => ({
      ...styles,
      backgroundColor: isSelected ? "#007bff" : "white",
      color: isSelected ? "white" : "black",
      "&:hover": { backgroundColor: "#ddd", color: "black" },
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: "white",
      color: "black",
    }),
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

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
          setFilteredData([]); // ซ่อนข้อมูลจนกว่าจะเลือก Filter

          // ✅ ดึงค่า Series Name
          const seriesNames = Array.from(new Set(jsonData.map((row) => row["Series Name"])))
            .filter(Boolean)
            .map((name) => ({ value: name.trim(), label: name.trim() }));
          setSeriesOptions(seriesNames);
        };

        reader.readAsArrayBuffer(blob);
      } catch (error) {
        console.error("❌ Error fetching Excel data:", error);
      }
    };

    fetchExcelData();
  }, []);

  useEffect(() => {
    if (selectedSeries?.value) {
      const filteredGrades = Array.from(
        new Set(
          data
            .filter((row) => row["Series Name"]?.trim() === selectedSeries.value.trim())
            .map((row) => row["รุ่น"])
            .filter(Boolean)
        )
      ).map((name) => ({ value: name.trim(), label: name.trim() }));

      setGradeOptions(filteredGrades);
      setSelectedGrade(null);
      setSelectedColor(null);
      setColorOptions([]);
    }
  }, [selectedSeries, data]);

  useEffect(() => {
    if (selectedSeries?.value && selectedGrade?.value) {
      const filteredColors = Array.from(
        new Set(
          data
            .filter(
              (row) =>
                row["Series Name"]?.trim() === selectedSeries.value.trim() &&
                row["รุ่น"]?.trim() === selectedGrade.value.trim()
            )
            .map((row) => row["สีภาษาไทย"])
            .filter(Boolean)
        )
      ).map((name) => ({
        value: name?.trim() || "",
        label: name?.trim() || "",
      }));

      setColorOptions(filteredColors);
      setSelectedColor(null);
    }
  }, [selectedSeries, selectedGrade, data]);

  const handleClearFilters = () => {
    setSelectedSeries(null);
    setSelectedGrade(null);
    setSelectedColor(null);
    setFilteredData([]);
  };

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

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">ตารางข้อมูลรถยนต์ + ตัวกรอง</h1>

      {isClient && (
        <div className={`${isMobile ? "flex flex-col gap-4" : "flex gap-4"} mb-4`}>
          <Select styles={customSelectStyles} options={seriesOptions} value={selectedSeries} onChange={setSelectedSeries} isClearable placeholder="เลือก Series Name" className="w-full" />
          <Select styles={customSelectStyles} options={gradeOptions} value={selectedGrade} onChange={setSelectedGrade} isClearable placeholder="เลือก Grade Name" className="w-full" />
          <Select styles={customSelectStyles} options={colorOptions} value={selectedColor} onChange={setSelectedColor} isClearable placeholder="เลือก Color Name" className="w-full" />
          <button onClick={handleClearFilters} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition w-full">เคลียร์ตัวกรอง</button>
        </div>
      )}

{filteredData.length > 0 && (
  <div className={`${isMobile ? "grid grid-cols-1 gap-4" : "block"}`}>
    {filteredData.map((car, index) => (
      <div key={index} className="border p-4 rounded-lg shadow-md">
        <p><strong>รุ่น:</strong> {car["รุ่น"]}</p>
        <p><strong>สี:</strong> {car["สีภาษาไทย"] ?? "N/A"}</p>
        <p><strong>ขนาดเครื่องยนต์:</strong> {car["ขนาดเครื่องยนต์ (ซีซี)"] ?? "N/A"}</p>
        <p><strong>กำลังมอเตอร์ไฟฟ้า:</strong> {car["กำลังมอเตอร์ไฟฟ้า (กิโลวัตต์)"] ?? "N/A"}</p>
        <p><strong>ประเภทของแบตเตอรี่:</strong> {car["ประเภทของแบตเตอรี่"] ?? "N/A"}</p>
        <p><strong>ขนาดความจุแบตเตอรี่:</strong> {car["ขนาดความจุแบตเตอรี่ (แอมแปร์-ชั่วโมง)"] ?? "N/A"}</p> 
        <p><strong>เลข Model:</strong> {car["Model"]}</p>
      </div>
    ))}
  </div>
)}
    </main>
  );
}
