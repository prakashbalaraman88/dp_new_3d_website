import jsPDF from 'jspdf';
import { Unit, Panel } from './types';


interface InteriorPDFData {
    clientName: string;
    units: Unit[];
    materialSummary: {
        ply16: number;
        ply6: number;
        accCost: number;
        laborCost: number;
        total: number;
    };
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

const generateRefNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `DP-INT-${year}${month}${day}-${random}`;
};

export const generateInteriorPDF = async (data: InteriorPDFData): Promise<void> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
    const refNumber = generateRefNumber();

    // Helper to load image
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

    // --- DRAW HEADER FUNCTION ---
    const drawHeader = async (title: string = 'Interior Quotation') => {
        doc.setFillColor(20, 20, 20); // Darker header
        doc.rect(0, 0, pageWidth, 45, 'F');

        try {
            const logo = await loadImage('/assets/images/logo.png');
            const logoWidth = 60;
            const ratio = logo.width / logo.height;
            let finalHeight = logoWidth / ratio;
            let finalWidth = logoWidth;

            if (finalHeight > 25) {
                finalHeight = 25;
                finalWidth = finalHeight * ratio;
            }

            doc.addImage(logo.data, 'PNG', margin, 10, finalWidth, finalHeight);
        } catch (e) {
            doc.setTextColor(212, 175, 55);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('Dezignpool', margin, 20);
        }

        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.text(title, margin, 27);
        doc.setTextColor(200, 200, 200);
        doc.text('Modular Interiors & Furniture', margin, 32);

        // Date & Ref
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(currentDate, pageWidth - margin, 15, { align: 'right' });
        doc.text(`Ref: ${refNumber}`, pageWidth - margin, 20, { align: 'right' });
    };

    // Initialize Page 1
    await drawHeader();

    // ===== PROJECT SUMMARY =====
    let yPos = 60;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Summary', margin, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Client Name: ${data.clientName || 'Valued Client'}`, margin, yPos);
    yPos += 10;

    // Summary Table Helpers
    const drawRow = (label: string, value: string, isTotal: boolean = false) => {
        if (isTotal) {
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
        } else {
            doc.setFont('helvetica', 'normal');
        }

        doc.text(label, margin + 2, yPos);
        doc.text(value, pageWidth - margin - 2, yPos, { align: 'right' });
        yPos += 8;
    };

    drawRow('Total Units', data.units.length.toString());
    drawRow('16mm Plywood Sheets', `${data.materialSummary.ply16} Nos`);
    drawRow('6mm Plywood Sheets', `${data.materialSummary.ply6} Nos`);
    drawRow('Accessories Cost', formatCurrency(data.materialSummary.accCost));
    drawRow('Labor & Finishing Cost', formatCurrency(data.materialSummary.laborCost));
    yPos += 2;
    drawRow('ESTIMATED GRAND TOTAL', formatCurrency(data.materialSummary.total), true);

    // ===== UNIT WISE BREAKDOWN =====
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Unit Wise Breakdown', margin, yPos);
    yPos += 8;

    // Table Header
    const col1 = margin;
    const col2 = margin + 50;
    const col3 = margin + 110;
    const col4 = pageWidth - margin - 5;

    const drawTableHeader = () => {
        doc.setFillColor(40, 40, 40);
        doc.rect(margin, yPos, contentWidth, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text('Unit Type', col1 + 2, yPos + 5.5);
        doc.text('Dimensions (WxHxD)', col2, yPos + 5.5);
        doc.text('Accessories', col3, yPos + 5.5);
        doc.text('Cost', col4, yPos + 5.5, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        yPos += 10;
    };

    drawTableHeader();

    data.units.forEach((unit, index) => {
        // Check Page Break
        if (yPos > pageHeight - 30) {
            doc.addPage();
            drawHeader('Interior Quotation (Cont.)'); // Re-draw header? Or simple header?
            yPos = 50;
            drawTableHeader();
        }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${unit.type.replace(/_/g, ' ')}`, col1 + 2, yPos);

        doc.setFont('helvetica', 'normal');
        doc.text(`${unit.dimensions.width} x ${unit.dimensions.height} x ${unit.dimensions.depth}`, col2, yPos);

        const accText = unit.accessories.length > 0
            ? unit.accessories.map(a => a.name).join(', ')
            : '-';
        // Wrap text for accessories
        const splitAcc = doc.splitTextToSize(accText, 60);
        doc.text(splitAcc, col3, yPos);

        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(unit.woodworkCost), col4, yPos, { align: 'right' });

        // Adjust yPos based on height of accessories text
        const rowHeight = Math.max(8, splitAcc.length * 4);

        // Draw bottom line
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, yPos + rowHeight - 3, pageWidth - margin, yPos + rowHeight - 3);

        yPos += rowHeight;
    });

    // ===== CUTTING LIST (FACTORY USE) =====
    doc.addPage();
    await drawHeader('Factory Cutting List');
    yPos = 55;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Cutting List (MCL)', margin, yPos);
    yPos += 10;

    // Collect ALL panels
    const allPanels: Panel[] = [];
    data.units.forEach((u, uIdx) => {
        u.panels.forEach(p => {
            // Add Unit Index to panel name for tracking
            allPanels.push({
                ...p,
                name: `U${uIdx + 1}-${p.name}`
            });
        });
    });

    // Table Header for Cutting List
    const clCol1 = margin; // ID
    const clCol2 = margin + 50; // LxW
    const clCol3 = margin + 90; // Material
    const clCol4 = pageWidth - margin - 5; // Qty

    const drawCLHeader = () => {
        doc.setFillColor(40, 40, 40);
        doc.rect(margin, yPos, contentWidth, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text('Part Name', clCol1 + 2, yPos + 5.5);
        doc.text('Size (mm)', clCol2, yPos + 5.5);
        doc.text('Material', clCol3, yPos + 5.5);
        doc.text('Qty', clCol4, yPos + 5.5, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        yPos += 10;
    };

    drawCLHeader();

    allPanels.forEach(panel => {
        if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20;
            drawCLHeader();
        }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        doc.text(panel.name, clCol1 + 2, yPos);
        doc.text(`${panel.length} x ${panel.width}`, clCol2, yPos);

        let matName = 'Core 16mm';
        if (panel.thickness === 6) matName = 'Back 6mm';
        if (panel.thickness === 18) matName = 'Shutter 18mm';

        doc.text(matName, clCol3, yPos);
        doc.text(panel.qty.toString(), clCol4, yPos, { align: 'right' });

        doc.setDrawColor(240, 240, 240);
        doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);

        yPos += 6;
    });

    doc.save(`DezignPool_Interior_Quote_${refNumber}.pdf`);
};
