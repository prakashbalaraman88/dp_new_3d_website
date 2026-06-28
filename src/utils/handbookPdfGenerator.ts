import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HANDBOOK_DATA } from '../data/constructionHandbook';

const COLORS: Record<string, [number, number, number]> = {
    gold: [212, 175, 55],      // #D4AF37
    white: [255, 255, 255],
    black: [0, 0, 0],
    grey: [80, 80, 80],
    lightGrey: [240, 240, 240],
    headerBg: [30, 30, 30],
};

const loadImage = (url: string): Promise<{ data: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.crossOrigin = "Anonymous";
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
        img.onerror = () => {
            // resolve null or throw? simpler to resolve null and skip image
            console.warn(`Failed to load image: ${url}`);
            resolve({ data: '', width: 0, height: 0 });
        };
    });
};

export const generateHandbookPDF = async (): Promise<void> => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    let yPos = 20;

    // --- COVER PAGE ---
    doc.setFillColor(COLORS.headerBg[0], COLORS.headerBg[1], COLORS.headerBg[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Logo on Cover
    try {
        const logo = await loadImage('/assets/images/logo.png');
        if (logo.data) {
            const logoWidth = 60;
            const ratio = logo.width / logo.height;
            const logoHeight = logoWidth / ratio;
            doc.addImage(logo.data, 'PNG', (pageWidth - logoWidth) / 2, 60, logoWidth, logoHeight);
        }
    } catch (e) {
        console.warn("Cover logo failed");
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
    doc.text('CLIENT CONSTRUCTION HANDBOOK', pageWidth / 2, 110, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.text('A Detailed Guide to Materials, Standards & Comparisons', pageWidth / 2, 125, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text('2025 Edition | DezignPool', pageWidth / 2, 180, { align: 'center' });


    // --- CONTENT PAGES ---

    // Iterate Categories
    for (const category of HANDBOOK_DATA) {
        // Iterate Topics
        for (const topic of category.topics) {
            doc.addPage();
            // Reset Background to White
            doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');

            yPos = 20;

            // Category Header (Small, Top Left)
            doc.setFont('times', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
            doc.text(category.categoryTitle.toUpperCase(), margin, yPos);

            // Topic Title
            yPos += 8;
            doc.setFontSize(22);
            doc.setTextColor(COLORS.headerBg[0], COLORS.headerBg[1], COLORS.headerBg[2]);
            doc.text(topic.title, margin, yPos);

            // Intro Text
            yPos += 10;
            doc.setFont('times', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(COLORS.grey[0], COLORS.grey[1], COLORS.grey[2]);
            const introLines = doc.splitTextToSize(topic.intro, pageWidth / 2); // Use half width for intro text
            doc.text(introLines, margin, yPos);

            // Image (Top Right)
            if (topic.image) {
                try {
                    const topicImg = await loadImage(topic.image);
                    if (topicImg.data) {
                        const imgWidth = 80;
                        const ratio = topicImg.width / topicImg.height;
                        const imgHeight = imgWidth / ratio;
                        // Right aligned
                        doc.addImage(topicImg.data, 'PNG', pageWidth - margin - imgWidth, 25, imgWidth, imgHeight);
                    }
                } catch (e) {
                    console.warn(`Failed to load topic image: ${topic.image}`);
                }
            }

            // Move Y position down after Intro
            yPos += (introLines.length * 5) + 15;
            // Or ensure we clear the image
            if (yPos < 90) yPos = 90;

            // COMPARISON TABLE
            const tableHeaders = [['Feature', ...topic.options.map(opt => opt.name)]];

            // We need to pivot the data for the table:
            // Rows: Description, Pros, Cons, Best For

            const tableBody = [
                // Description Row
                ['What is it?', ...topic.options.map(opt => opt.description)],
                // Pros Row
                ['Advantages', ...topic.options.map(opt => opt.pros.map(p => `• ${p}`).join('\n'))],
                // Cons Row
                ['Drawbacks', ...topic.options.map(opt => opt.cons.map(c => `• ${c}`).join('\n'))],
                // Best For Row
                ['Best For', ...topic.options.map(opt => opt.bestFor)],
                // Maintenance Row
                ['Care Tip', ...topic.options.map(opt => opt.maintenanceTip || 'Refer Manual')],
                // Lifespan Row
                ['Est. Lifespan', ...topic.options.map(opt => opt.lifespan || 'N/A')],
            ];

            autoTable(doc, {
                startY: yPos,
                head: tableHeaders,
                body: tableBody,
                theme: 'grid',
                headStyles: {
                    fillColor: COLORS.headerBg,
                    textColor: COLORS.gold,
                    fontStyle: 'bold',
                    fontSize: 11,
                    halign: 'center'
                },
                bodyStyles: {
                    textColor: COLORS.black,
                    fontSize: 10,
                    cellPadding: 4,
                    valign: 'top'
                },
                columnStyles: {
                    0: { cellWidth: 35, fontStyle: 'bold', fillColor: COLORS.lightGrey }, // Label Column
                    // Other columns adapt
                },
                styles: { font: 'times', overflow: 'linebreak' },
                didParseCell: (_data) => {
                    // Styling specifics for "Best For" row?
                }
            });

            // VERDICT Box
            // @ts-ignore
            let finalY = doc.lastAutoTable.finalY + 10;

            if (finalY > pageHeight - 30) {
                doc.addPage();
                finalY = 20;
            }

            doc.setFillColor(COLORS.lightGrey[0], COLORS.lightGrey[1], COLORS.lightGrey[2]);
            doc.roundedRect(margin, finalY, pageWidth - (margin * 2), 25, 3, 3, 'F');

            doc.setFont('times', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
            doc.text('DEZIGNPOOL VERDICT', margin + 5, finalY + 8);

            doc.setFont('times', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(COLORS.headerBg[0], COLORS.headerBg[1], COLORS.headerBg[2]);
            const verdictLines = doc.splitTextToSize(topic.verdict, pageWidth - (margin * 2) - 10);
            doc.text(verdictLines, margin + 5, finalY + 16);
        }
    }

    doc.save('DezignPool_Client_Handbook_2025.pdf');
};
