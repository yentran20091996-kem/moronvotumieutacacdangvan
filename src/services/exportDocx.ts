import { PILLARS, PILLAR_MAP } from '../data/curriculum';
import { PillarId, SavedSentence, StudentState, VocabItem } from '../types';

/**
 * Xuất tài liệu học tập chuẩn Microsoft Word (.doc / .docx)
 * Định dạng thân thiện với giáo viên & học sinh tiểu học tại Việt Nam:
 * - Font chuẩn: Times New Roman, 13pt
 * - Tiêu đề trường/lớp, bảng biểu, khung ghi chú
 * - Dòng kẻ tập viết cho học sinh
 */

function downloadDocFile(filename: string, htmlContent: string) {
  const header = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${filename}</title>
<style>
  @page {
    size: A4;
    margin: 2cm 2cm 2cm 2.5cm;
  }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 13pt;
    line-height: 1.45;
    color: #111827;
  }
  h1 {
    font-size: 18pt;
    font-weight: bold;
    text-align: center;
    color: #0F766E;
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  h2 {
    font-size: 14pt;
    font-weight: bold;
    color: #0F766E;
    border-bottom: 1.5pt solid #0F766E;
    padding-bottom: 3px;
    margin-top: 18px;
    margin-bottom: 8px;
  }
  .sub-header {
    text-align: center;
    font-style: italic;
    font-size: 11pt;
    color: #4B5563;
    margin-bottom: 16px;
  }
  .student-box {
    border: 1pt solid #D1D5DB;
    background-color: #F9FAFB;
    padding: 8px 12px;
    margin-bottom: 16px;
    border-radius: 4px;
  }
  .info-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8px;
  }
  .info-table td {
    padding: 4px 6px;
    font-size: 12pt;
  }
  .content-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    margin-bottom: 14px;
  }
  .content-table th {
    background-color: #E6F4EA;
    color: #065F46;
    border: 1pt solid #9CA3AF;
    padding: 6px 8px;
    font-weight: bold;
    font-size: 12pt;
    text-align: left;
  }
  .content-table td {
    border: 1pt solid #D1D5DB;
    padding: 6px 8px;
    font-size: 12pt;
    vertical-align: top;
  }
  .device-tag {
    display: inline-block;
    background-color: #FEF3C7;
    color: #92400E;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10pt;
    font-weight: bold;
    margin-right: 4px;
  }
  .writing-line {
    border-bottom: 1pt dotted #9CA3AF;
    height: 24px;
    margin-top: 6px;
    margin-bottom: 6px;
  }
  .tip-box {
    background-color: #ECFDF5;
    border-left: 3pt solid #10B981;
    padding: 8px 12px;
    margin: 10px 0;
    font-style: italic;
  }
  .footer-note {
    margin-top: 24px;
    text-align: center;
    font-size: 10pt;
    font-style: italic;
    color: #6B7280;
    border-top: 0.5pt solid #E5E7EB;
    padding-top: 8px;
  }
</style>
</head>
<body>`;

  const footer = `
  <div class="footer-note">
    Hành Trình Ngôn Từ — Ứng dụng mở rộng vốn từ & luyện viết văn biểu cảm lớp 5
  </div>
</body>
</html>`;

  const blob = new Blob(['\ufeff' + header + htmlContent + footer], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 1. Xuất "Sổ Tay Ngôn Từ Cá Nhân" của học sinh ra Word (.doc / .docx)
 */
export function exportStudentNotebookDocx(
  student: StudentState,
  savedVocabs: VocabItem[]
) {
  const dateStr = new Date().toLocaleDateString('vi-VN');

  const html = `
  <h1>SỔ TAY NGÔN TỪ CÁ NHÂN</h1>
  <div class="sub-header">Tuyển tập câu văn hay & vốn từ biểu cảm — Tiếng Việt lớp 5</div>

  <div class="student-box">
    <table class="info-table">
      <tr>
        <td style="width: 50%;"><strong>Sĩ tử nhí:</strong> ${student.nickname}</td>
        <td style="width: 50%;"><strong>Ngày xuất sổ tay:</strong> ${dateStr}</td>
      </tr>
      <tr>
        <td><strong>Điểm tích lũy (XP):</strong> ${student.stats.xp} điểm</td>
        <td><strong>Số câu văn đã tích lũy:</strong> ${student.savedSentenceIds.length} câu</td>
      </tr>
    </table>
  </div>

  <h2>I. NHỮNG CÂU VĂN ĐÃ ĐƯỢC NÂNG CẤP XUẤT SẮC</h2>
  ${
    student.savedSentenceIds.length === 0
      ? '<p style="font-style: italic; color: #6B7280;">Bạn nhỏ chưa lưu câu văn nào vào sổ tay. Hãy vào mục "Nâng cấp" để rèn luyện thêm nhé!</p>'
      : `
    <table class="content-table">
      <thead>
        <tr>
          <th style="width: 8%;">STT</th>
          <th style="width: 20%;">Trụ cột & Tu từ</th>
          <th style="width: 32%;">Câu văn mộc ban đầu</th>
          <th style="width: 40%;">Câu văn sau khi nâng cấp giàu hình ảnh</th>
        </tr>
      </thead>
      <tbody>
        ${student.savedSentenceIds
          .map((s, idx) => {
            const pillarTitle = PILLAR_MAP[s.pillar]?.shortTitle || s.pillar;
            return `
          <tr>
            <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
            <td>
              <strong>${pillarTitle}</strong><br/>
              ${s.devices.map((d) => `<span class="device-tag">${d}</span>`).join(' ')}
            </td>
            <td style="color: #4B5563;">"${s.original}"</td>
            <td style="font-weight: 500; color: #0F766E;">"${s.upgraded}"</td>
          </tr>
          `;
          })
          .join('')}
      </tbody>
    </table>
  `
  }

  <h2>II. KHO TỪ VỰNG TÂM ĐẮC ĐÃ LƯU TRỮ (${savedVocabs.length} từ)</h2>
  ${
    savedVocabs.length === 0
      ? '<p style="font-style: italic; color: #6B7280;">Chưa có từ vựng nào được đánh dấu. Hãy ghé qua "Kho từ" để khám phá thêm từ láy, so sánh và nhân hóa nhé!</p>'
      : `
    <table class="content-table">
      <thead>
        <tr>
          <th style="width: 6%;">STT</th>
          <th style="width: 22%;">Từ ngữ / Cụm từ</th>
          <th style="width: 20%;">Phân loại</th>
          <th style="width: 26%;">Ý nghĩa gợi tả</th>
          <th style="width: 26%;">Câu văn mẫu lớp 5</th>
        </tr>
      </thead>
      <tbody>
        ${savedVocabs
          .map(
            (v, idx) => `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td><strong style="color: #0F766E; font-size: 13pt;">${v.word}</strong></td>
            <td><span class="device-tag">${v.category}</span></td>
            <td>${v.meaning}</td>
            <td style="font-style: italic;">"${v.example}"</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `
  }

  <h2>III. GHI CHÚ RÈN LUYỆN DÀNH CHO BẠN NHỎ</h2>
  <div class="tip-box">
    <strong>Bí kíp từ Trợ lý Ngôn Từ:</strong> "Muốn đoạn văn có hồn, hãy nhớ nguyên tắc: 
    <em>Nhìn bằng mắt</em> (màu sắc, hình dáng), <em>lắng nghe bằng tai</em> (âm thanh sống động), 
    <em>cảm nhận bằng tim</em> (so sánh và nhân hóa thân thương)."
  </div>
  <div class="writing-line"></div>
  <div class="writing-line"></div>
  <div class="writing-line"></div>
  `;

  downloadDocFile(
    `So_Tay_Ngon_Tu_${student.nickname.replace(/\s+/g, '_')}.doc`,
    html
  );
}

/**
 * 2. Xuất "Phiếu Luyện Tập Viết Văn Lớp 5" theo từng Trụ cột ra Word (.doc / .docx)
 */
export function exportPillarWorksheetDocx(pillarId: PillarId) {
  const p = PILLAR_MAP[pillarId];
  if (!p) return;

  const html = `
  <h1>PHIẾU BÀI TẬP RÈN LUYỆN VIẾT VĂN LỚP 5</h1>
  <div class="sub-header">Chuyên đề: ${p.title.toUpperCase()}</div>

  <div class="student-box">
    <table class="info-table">
      <tr>
        <td style="width: 50%;">Họ và tên học sinh: ....................................................</td>
        <td style="width: 50%;">Lớp: ..................... Trường: .......................................</td>
      </tr>
      <tr>
        <td>Ngày làm bài: ...... / ...... / 202...</td>
        <td>Điểm / Lời nhận xét: .....................................................</td>
      </tr>
    </table>
  </div>

  <h2>I. PHƯƠNG PHÁP & BÍ KÍP QUAN SÁT CỐT LÕI</h2>
  <div class="tip-box">
    <strong>${p.pedagogicalMethod}:</strong> ${p.methodDetail}
  </div>

  <table class="content-table">
    <thead>
      <tr>
        <th style="width: 30%;">Phần bài viết</th>
        <th style="width: 70%;">Yêu cầu & Gợi ý nội dung</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Mở đoạn / Mở bài</strong></td>
        <td>${p.outline.opening}</td>
      </tr>
      <tr>
        <td><strong>Thân đoạn / Thân bài</strong></td>
        <td>
          <ul style="margin: 4px 0; padding-left: 18px;">
            ${p.outline.body.map((b) => `<li>${b}</li>`).join('')}
          </ul>
        </td>
      </tr>
      <tr>
        <td><strong>Kết đoạn / Kết bài</strong></td>
        <td>${p.outline.closing}</td>
      </tr>
    </tbody>
  </table>

  <h2>II. CÂU HỎI THỰC HÀNH RÈN LUYỆN</h2>

  <p><strong>Bài tập 1 (Nâng cấp câu văn đơn giản):</strong> Cho câu văn mộc mạc sau:</p>
  <div style="padding: 6px 12px; background: #F3F4F6; border-left: 2pt solid #9CA3AF; font-style: italic; margin-bottom: 8px;">
    "${p.sampleSimpleSentence}"
  </div>
  <p>Em hãy nâng cấp câu văn trên thành 2 câu mới giàu hình ảnh hơn:</p>
  <p><em>a) Dùng ít nhất 1 từ láy và 1 từ gợi tả màu sắc/âm thanh:</em></p>
  <div class="writing-line"></div>
  <p><em>b) Sử dụng biện pháp tu từ So sánh hoặc Nhân hóa:</em></p>
  <div class="writing-line"></div>

  <p style="margin-top: 16px;"><strong>Bài tập 2 (Luyện viết đoạn văn ngắn từ 4-6 câu):</strong></p>
  <p>Em hãy chọn một trong các đề bài gợi ý sau để viết một đoạn văn hoàn chỉnh:</p>
  <ul style="padding-left: 20px; color: #1E293B;">
    ${p.practicePrompts.map((prompt) => `<li>${prompt}</li>`).join('')}
  </ul>

  <p style="margin-top: 10px;"><strong>Bài làm của em:</strong></p>
  <div class="writing-line"></div>
  <div class="writing-line"></div>
  <div class="writing-line"></div>
  <div class="writing-line"></div>
  <div class="writing-line"></div>
  <div class="writing-line"></div>
  <div class="writing-line"></div>
  <div class="writing-line"></div>
  `;

  downloadDocFile(`Phieu_Luyen_Tap_${pillarId}.doc`, html);
}
