import jsPDF from 'jspdf';

export interface MaterialSelection {
    category: string;
    label: string;
    tier: string;
    priceMod: number;
    modType: 'per_sqft' | 'lump_sum';
}

interface PDFData {
    clientName: string;
    builtUpArea: number;
    tier: string;
    siteCondition: string;
    selections: MaterialSelection[];
    totalCost: number;
    perSqFtCost: number;
    totalLumpSum?: number;
    compoundWallCost?: number;
}

const COLORS = {
    bg: [18, 18, 18],     // #121212 Very Dark Grey
    gold: [212, 175, 55], // #D4AF37 Gold
    white: [255, 255, 255],
    grey: [150, 150, 150],
    darkGrey: [40, 40, 40],
};

// Use "INR" text instead of symbol to prevent font rendering issues in standard PDF fonts
const formatCurrency = (amount: number) => {
    return 'INR ' + new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
    }).format(amount);
};

// Sanitize labels to replace ₹ symbol (not supported by jsPDF standard fonts)
const sanitizeLabel = (text: string) => {
    return text.replace(/₹/g, 'Rs.');
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

// --- DRAWING HELPERS ---

const drawWavyPattern = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
    // "Luxury Waves" - Subtle textured curves
    // Very faint gold/dark color for subtle impact
    doc.setDrawColor(45, 40, 25); // Almost black-gold
    doc.setLineWidth(0.1);

    const step = 8;

    // Top-Right Corner - Flowing down-left
    for (let i = 0; i < 30; i++) {
        const offset = i * step;
        const x1 = pageWidth - 140 + offset;
        const y1 = 0;
        const x2 = pageWidth;
        const y2 = 140 - offset;

        if (y2 > 0 && x1 < pageWidth) {
            doc.moveTo(x1, y1);
            doc.curveTo(x1 + 30, y1 + 50, x2 - 50, y2 - 30, x2, y2);
            doc.stroke();
        }
    }

    // Bottom-Left Corner - Flowing up-right
    for (let i = 0; i < 30; i++) {
        const offset = i * step;
        const x1 = 0;
        const y1 = pageHeight - 140 + offset;
        const x2 = 140 - offset;
        const y2 = pageHeight;

        if (y1 < pageHeight && x2 > 0) {
            doc.moveTo(x1, y1);
            doc.curveTo(x1 + 50, y1 + 30, x2 - 30, y2 - 50, x2, y2);
            doc.stroke();
        }
    }
};

const drawWalletIcon = (doc: jsPDF, x: number, y: number, size: number) => {
    doc.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, size, size * 0.8, 1, 1);
    doc.roundedRect(x + size * 0.6, y + size * 0.2, size * 0.4, size * 0.2, 0.5, 0.5);
    doc.circle(x + size * 0.8, y + size * 0.3, size * 0.05);
};

const drawShieldIcon = (doc: jsPDF, x: number, y: number, size: number) => {
    doc.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.setLineWidth(0.5);
    const centerX = x + size / 2;
    const bottomY = y + size;
    const topY = y;
    const sideH = size * 0.6;

    doc.line(x, topY, x + size, topY);
    doc.line(x, topY, x, y + sideH);
    doc.line(x + size, topY, x + size, y + sideH);
    doc.line(x, y + sideH, centerX, bottomY);
    doc.line(x + size, y + sideH, centerX, bottomY);

    doc.line(x + size * 0.3, y + size * 0.4, x + size * 0.5, y + size * 0.6);
    doc.line(x + size * 0.5, y + size * 0.6, x + size * 0.7, y + size * 0.3);
};

const drawCrownIcon = (doc: jsPDF, x: number, y: number, size: number) => {
    doc.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.setLineWidth(0.5);
    const h = size * 0.6;
    const startY = y + size * 0.2;

    doc.line(x, startY + h, x + size, startY + h);
    doc.line(x, startY + h, x, startY);
    doc.line(x, startY, x + size * 0.25, startY + h * 0.6);
    doc.line(x + size * 0.25, startY + h * 0.6, x + size * 0.5, y);
    doc.line(x + size * 0.5, y, x + size * 0.75, startY + h * 0.6);
    doc.line(x + size * 0.75, startY + h * 0.6, x + size, startY);
    doc.line(x + size, startY, x + size, startY + h);
};

export const generatePDF = async (data: PDFData): Promise<void> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    const setGold = () => doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    const setWhite = () => doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    const setGrey = () => doc.setTextColor(COLORS.grey[0], COLORS.grey[1], COLORS.grey[2]);

    // Set Global Font to Helvetica (Standard) instead of Times
    doc.setFont('helvetica', 'normal');

    // Helper to add a new dark themed page
    let yPos = 60; // Initial Y
    const addDarkPage = () => {
        doc.addPage();
        doc.setFillColor(COLORS.bg[0], COLORS.bg[1], COLORS.bg[2]);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        drawWavyPattern(doc, pageWidth, pageHeight);
        yPos = 30; // Reset Y for new page
    };

    // --- PAGE 1: COVER ---
    doc.setFillColor(COLORS.bg[0], COLORS.bg[1], COLORS.bg[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    drawWavyPattern(doc, pageWidth, pageHeight);

    try {
        const logo = await loadImage('/assets/images/logo.png');
        const logoWidth = 50;
        const ratio = logo.width / logo.height;
        const logoHeight = logoWidth / ratio;
        const logoX = (pageWidth - logoWidth) / 2;
        doc.addImage(logo.data, 'PNG', logoX, yPos, logoWidth, logoHeight);
        yPos += logoHeight + 30;
    } catch (e) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(40);
        setGold();
        doc.text('DEZIGNPOOL', pageWidth / 2, yPos + 10, { align: 'center' });
        yPos += 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    setWhite();
    doc.text('PREMIUM CONSTRUCTION', pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;
    doc.text('ESTIMATE PROPOSAL', pageWidth / 2, yPos, { align: 'center' });

    yPos += 20;
    doc.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.setLineWidth(0.5);
    doc.line(margin + 20, yPos, pageWidth - margin - 20, yPos);

    yPos += 40;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    setGrey();
    doc.text('PREPARED FOR', pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    setGold();
    doc.text(data.clientName || 'Valued Client', pageWidth / 2, yPos, { align: 'center' });

    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    yPos = pageHeight - 40;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setWhite();
    doc.text(dateStr, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    doc.setFontSize(8);
    setGrey();
    doc.text('Designed & Curated by Dezignpool', pageWidth / 2, yPos, { align: 'center' });


    // --- PAGE 2: USP / WHY US ---
    addDarkPage();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    setGold();
    doc.text('THE DEZIGNPOOL DIFFERENCE', margin, yPos);

    yPos += 30;
    drawWalletIcon(doc, margin, yPos + 2, 10);
    doc.setFontSize(16);
    setWhite();
    doc.text('   Total Transparency with "Wallets"', margin + 15, yPos + 8);
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setGrey();
    const text1 = doc.splitTextToSize("Unlike traditional contractors who give vague quotes, we use a 'Wallet System'. For every item (tiles, sanitaryware), we allocate a specific budget. If you pick a cheaper option, you SAVE money instantly. If you go premium, you only pay the difference. You see exactly where every rupee goes.", pageWidth - (margin * 2) - 10);
    doc.text(text1, margin + 15, yPos);

    yPos += 35;
    drawShieldIcon(doc, margin, yPos + 2, 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    setWhite();
    doc.text('   No Hidden Surprises', margin + 15, yPos + 8);
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setGrey();
    const text2 = doc.splitTextToSize("Our estimate includes the 'Base Rate' plus your customized upgrades. The 'Total Estimated Cost' you see is real. We don't believe in low-balling the initial quote and charging for 'extras' later. Our logic covers structural, finishing, and even variable items like Compound Walls upfront.", pageWidth - (margin * 2) - 10);
    doc.text(text2, margin + 15, yPos);

    yPos += 35;
    drawCrownIcon(doc, margin, yPos + 2, 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    setWhite();
    doc.text('   Bespoke Tiers: From Civitas to Sovereign', margin + 15, yPos + 8);
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setGrey();
    const text3 = doc.splitTextToSize(`You selected the ${data.tier.toUpperCase()} tier. This isn't just a label; it's a curated specification standard designed for a specific lifestyle. Whether it's the durability of Civitas or the sheer opulence of Sovereign, your home is built to a precise, documented standard.`, pageWidth - (margin * 2) - 10);
    doc.text(text3, margin + 15, yPos);


    // --- PAGE 3: ESTIMATE TABLE ---
    doc.addPage();
    // Default white background for easy reading of table
    doc.setFillColor(COLORS.bg[0], COLORS.bg[1], COLORS.bg[2]);
    doc.rect(0, 0, pageWidth, 50, 'F'); // Dark Banner at Top

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    setGold();
    doc.text('PROJECT FINANCIALS', margin, 25);
    setWhite();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tier: ${data.tier}  |  Area: ${data.builtUpArea.toLocaleString()} sq.ft`, margin, 32);

    yPos = 60;

    const col1 = margin;
    const col2 = margin + 110;
    const col3 = pageWidth - margin - 5;
    const rowH = 10;

    doc.setFillColor(COLORS.darkGrey[0], COLORS.darkGrey[1], COLORS.darkGrey[2]);
    doc.rect(margin, yPos, pageWidth - (margin * 2), rowH, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setGold();
    doc.text('ITEM / SPECIFICATION', col1 + 2, yPos + 6);
    doc.text('TIER STD', col2, yPos + 6);
    doc.text('COST IMPACT', col3, yPos + 6, { align: 'right' });

    yPos += rowH;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    data.selections.forEach((item, index) => {
        // Enforce font before calculating lines to be safe
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        // Split text to fit columns - sanitize to remove ₹ symbol
        const labelWidth = col2 - col1 - 5;
        const labelLines = doc.splitTextToSize(sanitizeLabel(item.label), labelWidth);
        const rowHeight = Math.max(10, labelLines.length * 4 + 4);

        if (yPos + rowHeight > pageHeight - 30) {
            doc.addPage();
            yPos = 30;
            // Header for new page
            doc.setFillColor(COLORS.darkGrey[0], COLORS.darkGrey[1], COLORS.darkGrey[2]);
            doc.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            setGold();
            doc.text('ITEM / SPECIFICATION', col1 + 2, yPos + 6);
            doc.text('TIER STD', col2, yPos + 6);
            doc.text('COST IMPACT', col3, yPos + 6, { align: 'right' });
            yPos += 10;
        }

        if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, yPos, pageWidth - (margin * 2), rowHeight, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        doc.text(labelLines, col1 + 2, yPos + 4); // Adjusted Y for multi-line
        doc.text(item.tier.toUpperCase(), col2, yPos + 6);

        let impactText = '-';
        if (item.priceMod !== 0) {
            const sign = item.priceMod > 0 ? '+' : '-';
            const unit = item.modType === 'lump_sum' ? '(Fixed)' : '/ sqft';
            const amount = formatCurrency(Math.abs(item.priceMod));
            impactText = `${sign} ${amount} ${unit}`;
        }
        doc.text(impactText, col3, yPos + 6, { align: 'right' });

        yPos += rowHeight;
    });

    // --- TOTALS CARD ---
    yPos += 10;
    if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 30;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Final Construction Rate:', margin, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(data.perSqFtCost) + ' / sq.ft', pageWidth - margin, yPos, { align: 'right' });
    yPos += 8;

    if (data.totalLumpSum) {
        doc.setFont('helvetica', 'normal');
        doc.text('Variable Add-ons (Lump Sum):', margin, yPos);
        doc.text((data.totalLumpSum > 0 ? '+' : '') + formatCurrency(data.totalLumpSum), pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;
    }
    if (data.compoundWallCost) {
        doc.setFont('helvetica', 'normal');
        doc.text('Compound Wall Cost:', margin, yPos);
        doc.text('+' + formatCurrency(data.compoundWallCost), pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;
    }

    yPos += 10;
    doc.setFillColor(COLORS.bg[0], COLORS.bg[1], COLORS.bg[2]);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 20, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    setGold();
    doc.text('TOTAL ESTIMATED COST', margin + 10, yPos + 13);

    doc.setFontSize(16);
    setWhite();
    doc.text(formatCurrency(data.totalCost), pageWidth - margin - 15, yPos + 13, { align: 'right' });


    // --- PAGE 4: TERMS & SCHEDULES ---
    addDarkPage();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    setGold();
    doc.text('TERMS & COMMITMENT', margin, yPos);

    yPos += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setWhite();

    const terms = [
        "1. Validity: This estimate is valid for 15 days from the date of issue.",
        "2. Exclusions: Approvals/liasoning fees and loose furniture are not included unless specified.",
        "3. Payment Schedule: Payments will be linked to construction milestones (e.g., Plinth, Lintel, Roof).",
        "4. Force Majeure: Timelines may vary due to unforeseen circumstances or material shortages.",
        "5. Final Measurement: Final billing will be based on actual onsite joint measurements.",
        "6. GST: All prices mentioned are inclusive of GST."
    ];

    terms.forEach(term => {
        const lines = doc.splitTextToSize(term, pageWidth - (margin * 2));
        doc.text(lines, margin, yPos);
        yPos += (lines.length * 6) + 4;
    });

    // --- TIMELINE TABLE ---
    yPos += 10;
    if (yPos > pageHeight - 80) { addDarkPage(); }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    setGold();
    doc.text('PROPOSED TIMELINE', margin, yPos);
    yPos += 8;

    const timelineData = [
        ["Initial Architectural Design + Structural Drawings", "1 Month"],
        ["Construction (Basement, Structure, Plastering, Flooring, Painting, Electrical, Plumbing)", "14 Months"],
        ["Interiors", "2 Months"],
        ["Miscellaneous", "1 Month"],
        ["Total", "18 Months"]
    ];

    const timelineHead = ["PHASE / ACTIVITY", "DURATION"];
    // Header
    doc.setFillColor(COLORS.darkGrey[0], COLORS.darkGrey[1], COLORS.darkGrey[2]);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
    doc.setFontSize(9);
    setGold();
    doc.text(timelineHead[0], margin + 2, yPos + 5);
    doc.text(timelineHead[1], pageWidth - margin - 30, yPos + 5);
    yPos += 8;

    // Body
    timelineData.forEach((row, i) => {
        const isTotal = i === timelineData.length - 1;
        const rowHeight = isTotal ? 8 : 12;

        if (yPos > pageHeight - 20) { addDarkPage(); }

        // Draw Row Background to ensure text readability on Dark Page
        if (isTotal) {
            doc.setFillColor(COLORS.darkGrey[0], COLORS.darkGrey[1], COLORS.darkGrey[2]);
        } else if (i % 2 === 0) {
            doc.setFillColor(240, 240, 240); // Light Grey
        } else {
            doc.setFillColor(255, 255, 255); // White
        }
        doc.rect(margin, yPos, pageWidth - (margin * 2), rowHeight, 'F');

        // Text
        if (isTotal) {
            setGold();
            doc.setFont('helvetica', 'bold');
        } else {
            doc.setTextColor(0, 0, 0); // Black
            doc.setFont('helvetica', 'normal');
        }

        const activityLines = doc.splitTextToSize(row[0], pageWidth - (margin * 2) - 40);
        doc.text(activityLines, margin + 2, yPos + 5);
        doc.text(row[1], pageWidth - margin - 30, yPos + 5);

        yPos += rowHeight;
    });

    // --- PAYMENT SCHEDULE TABLE ---
    yPos += 15;
    if (yPos > pageHeight - 100) { addDarkPage(); }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    setGold();
    doc.text('PAYMENT SCHEDULE', margin, yPos);
    yPos += 8;

    const paymentData = [
        ["Booking/Contract Signing", "2%", "2%"],
        ["On Design Sign off - Before Start of Work", "18%", "20%"],
        ["Completion of Excavation, Foundation and Plinth Level", "10%", "30%"],
        ["Completion of Ground Floor Slab", "10%", "40%"],
        ["Completion of 1st Floor Slab", "10%", "50%"],
        ["Completion of 2nd Floor Slab", "10%", "60%"],
        ["Completion of 3rd Floor Slab", "10%", "70%"],
        ["Completion of Brick work and Internal Plastering", "10%", "80%"],
        ["Completion of Exterior Plastering, Flooring, Windows", "10%", "90%"],
        ["Completion of Doors, Painting, Electrical and Plumbing", "7%", "97%"],
        ["Handover and Possession", "3%", "100%"]
    ];

    // Header
    doc.setFillColor(COLORS.darkGrey[0], COLORS.darkGrey[1], COLORS.darkGrey[2]);
    doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
    doc.setFontSize(9);
    setGold();
    doc.text("MILESTONE", margin + 2, yPos + 5);
    doc.text("PAYMENT %", pageWidth - margin - 60, yPos + 5);
    doc.text("CUMULATIVE", pageWidth - margin - 25, yPos + 5);
    yPos += 8;

    // Body
    paymentData.forEach((row, i) => {
        const rowHeight = 10;
        if (yPos > pageHeight - 30) {
            addDarkPage();
            // Reprint Header?
            doc.setFillColor(COLORS.darkGrey[0], COLORS.darkGrey[1], COLORS.darkGrey[2]);
            doc.rect(margin, yPos, pageWidth - (margin * 2), 8, 'F');
            doc.setFontSize(9);
            setGold();
            doc.text("MILESTONE", margin + 2, yPos + 5);
            doc.text("PAYMENT %", pageWidth - margin - 60, yPos + 5);
            doc.text("CUMULATIVE", pageWidth - margin - 25, yPos + 5);
            yPos += 8;
        }

        if (i % 2 === 0) doc.setFillColor(240, 240, 240);
        else doc.setFillColor(255, 255, 255);
        doc.rect(margin, yPos, pageWidth - (margin * 2), rowHeight, 'F');

        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');

        const milestoneLines = doc.splitTextToSize(row[0], pageWidth - (margin * 2) - 70);
        doc.text(milestoneLines, margin + 2, yPos + 5);
        doc.text(row[1], pageWidth - margin - 60, yPos + 5);
        doc.text(row[2], pageWidth - margin - 25, yPos + 5);

        yPos += rowHeight;
    });

    // --- SIGNATURES ---
    if (yPos > pageHeight - 40) {
        addDarkPage();
        yPos = pageHeight - 60;
    } else {
        yPos = Math.max(yPos + 30, pageHeight - 60);
    }

    doc.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.line(margin, yPos, margin + 80, yPos);

    setWhite();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Client Signature', margin, yPos + 8);

    doc.line(pageWidth - margin - 80, yPos, pageWidth - margin, yPos);
    doc.text('Dezignpool Representative', pageWidth - margin - 80, yPos + 8);

    doc.save(`Dezignpool_Premium_Quote_${(data.clientName || 'Client').replace(/\s+/g, '_')}.pdf`);
};
