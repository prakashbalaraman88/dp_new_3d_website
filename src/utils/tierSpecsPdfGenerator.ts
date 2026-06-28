import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TIER_SPECIFICATIONS } from '../data/tierSpecifications';

const COLORS: Record<string, [number, number, number]> = {
    gold: [212, 175, 55],      // #D4AF37 Gold
    white: [255, 255, 255],
    black: [0, 0, 0],
    grey: [100, 100, 100],
    headerBg: [45, 45, 45],    // Dark grey for table headers
    lightGrey: [245, 245, 245],
};

// Helper: Load Image
const loadImage = (url: string): Promise<{ data: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve({
                    data: canvas.toDataURL('image/png'),
                    width: img.width,
                    height: img.height
                });
            } else {
                reject('Canvas context failed');
            }
        };
        img.onerror = reject;
    });
};

export const generateTierSpecsPDF = async (): Promise<void> => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // Helper to sanitize text (replace Rupee symbol)
    const sanitize = (text: string) => text.replace(/₹/g, 'Rs. ');

    let yPos = 20;

    // --- HEADER ---
    // Logo
    try {
        const logo = await loadImage('/assets/images/logo.png');
        const logoWidth = 35;
        const ratio = logo.width / logo.height;
        const logoHeight = logoWidth / ratio;
        doc.addImage(logo.data, 'PNG', margin, 10, logoWidth, logoHeight);
    } catch (e) {
        console.warn("Logo load failed", e);
        doc.setFontSize(18);
        doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
        doc.setFont('times', 'bold');
        doc.text('DEZIGNPOOL', margin, 22);
    }

    // Title
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(COLORS.headerBg[0], COLORS.headerBg[1], COLORS.headerBg[2]);
    doc.text('RESIDENTIAL CONST. SPECIFICATION & VALUATION REPORT', pageWidth - margin, 18, { align: 'right' });

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.grey[0], COLORS.grey[1], COLORS.grey[2]);
    doc.text('Bangalore Metropolitan Region (2025-2026)', pageWidth - margin, 25, { align: 'right' });

    yPos = 40;

    // Executive Summary
    doc.setFontSize(10);
    doc.setTextColor(COLORS.grey[0], COLORS.grey[1], COLORS.grey[2]);
    const summaryLines = doc.splitTextToSize(TIER_SPECIFICATIONS.executiveSummary, pageWidth - (margin * 2));
    doc.text(summaryLines, margin, yPos);
    yPos += (summaryLines.length * 5) + 8;

    // --- PRICING HIERARCHY TABLE ---
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.text('1. PRICING HIERARCHY', margin, yPos);
    yPos += 3;

    const pricingHeaders = [['Tier', 'Name', 'Rank', 'Base Price (per sqft)', 'Target Profile']];
    const pricingBody = TIER_SPECIFICATIONS.pricingHierarchy.map(item => [
        item.tier,
        item.name,
        item.rank,
        sanitize(item.price),
        item.profile
    ]);

    autoTable(doc, {
        startY: yPos,
        head: pricingHeaders,
        body: pricingBody,
        theme: 'grid',
        headStyles: {
            fillColor: COLORS.gold,
            textColor: COLORS.black,
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 9
        },
        bodyStyles: { textColor: COLORS.black, fontSize: 9 },
        alternateRowStyles: { fillColor: COLORS.lightGrey },
        columnStyles: {
            0: { halign: 'center', cellWidth: 15 },
            1: { fontStyle: 'bold', cellWidth: 28 },
            2: { halign: 'center', cellWidth: 22 },
            3: { halign: 'center', fontStyle: 'bold', cellWidth: 35 },
            4: { cellWidth: 'auto' }
        },
        styles: { font: 'times', cellPadding: 2.5, overflow: 'linebreak' },
    });

    // @ts-ignore
    yPos = doc.lastAutoTable.finalY + 12;

    // --- DETAILED SPECIFICATIONS ---
    TIER_SPECIFICATIONS.categories.forEach((cat, index) => {
        // Section Title
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
        const title = `2.${index + 1} ${cat.title}`;
        doc.text(title, margin, yPos);
        yPos += 3;

        // Sanitize rows
        const sanitizedRows = cat.rows.map(row => row.map(cell => sanitize(cell)));

        // Table
        autoTable(doc, {
            startY: yPos,
            head: [cat.headers],
            body: sanitizedRows,
            theme: 'grid',
            headStyles: {
                fillColor: COLORS.headerBg,
                textColor: COLORS.gold,
                fontStyle: 'bold',
                fontSize: 7,
                halign: 'center'
            },
            bodyStyles: {
                textColor: COLORS.black,
                fontSize: 6.5,
                cellPadding: 1.5
            },
            alternateRowStyles: { fillColor: COLORS.lightGrey },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 28 },
            },
            styles: { font: 'times', overflow: 'linebreak', minCellHeight: 8 },
        });

        // @ts-ignore
        yPos = doc.lastAutoTable.finalY + 10;
    });

    // Save
    doc.save('DezignPool_Tier_Specifications_2025.pdf');
};
