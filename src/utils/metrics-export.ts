// PDF Export Helper for Health Metrics
// This provides a template for future PDF export implementation

import type { MetricData, MetricReading } from '@/src/data/metrics-data';

/**
 * Generate PDF report for health metrics
 * Future implementation will use a library like react-native-pdfkit or similar
 */
export async function generateMetricsPDF(
    memberName: string,
    metricData: MetricData,
): Promise<void> {
    const now = new Date();
    const timestamp = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const fileName = `${metricData.label}-${memberName}-${now.getTime()}.pdf`;

    const pdfContent = {
        title: `Báo cáo ${metricData.label}`,
        member: memberName,
        generatedAt: timestamp,
        metric: metricData.label,
        unit: metricData.unit,
        latestValue: metricData.latestValue,
        latestStatus: metricData.latestStatus,
        readings: metricData.readings,
        chartData: metricData.chartData,
    };

    console.log('PDF Report Content:', pdfContent);
    console.log(`PDF file will be generated: ${fileName}`);

    // TODO: Implement actual PDF generation using:
    // - react-native-pdfkit
    // - react-native-html-to-pdf
    // - Or Backend API for PDF generation
}

export function formatMetricsForExport(
    memberName: string,
    metricData: MetricData,
): string {
    const now = new Date();
    const timestamp = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const lines: string[] = [];

    lines.push(`${'='.repeat(60)}`);
    lines.push(`BÁO CÁO ${metricData.label.toUpperCase()}`);
    lines.push(`${'='.repeat(60)}`);
    lines.push('');

    lines.push(`Thành viên: ${memberName}`);
    lines.push(`Ngày tạo: ${timestamp}`);
    lines.push('');

    lines.push(`GIÁ TRỊ MỚI NHẤT`);
    lines.push(`-`.repeat(60));
    lines.push(`Giá trị: ${metricData.latestValue} ${metricData.unit}`);
    lines.push(`Ngày đo: ${metricData.latestDate}`);
    lines.push(`Trạng thái: ${metricData.latestStatus}`);
    lines.push('');

    lines.push(`LỊCH SỬ ĐO LƯỜNG`);
    lines.push(`-`.repeat(60));
    metricData.readings.forEach((reading: MetricReading) => {
        lines.push(
            `${reading.dateFull} | ${reading.value} ${metricData.unit} | ${reading.status}`,
        );
    });

    lines.push('');
    lines.push(`${'='.repeat(60)}`);

    return lines.join('\n');
}
