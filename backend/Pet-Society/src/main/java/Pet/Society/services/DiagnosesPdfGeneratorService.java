package Pet.Society.services;

import Pet.Society.models.dto.diagnoses.DiagnosesDTOResponse;
import Pet.Society.models.interfaces.PdfGenerator;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class DiagnosesPdfGeneratorService implements PdfGenerator<DiagnosesDTOResponse> {
    @Override
    public byte[] generate(DiagnosesDTOResponse dto) {

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdfDocument = new PdfDocument(writer);
        Document document = new Document(pdfDocument);

        Paragraph title = new Paragraph("Diagnóstico Veterinario")
                .setBold()
                .setFontSize(18);

        document.add(title);
        document.add(new Paragraph("\n"));

        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1,2}))
                .useAllAvailableWidth();

        infoTable.addCell(new Cell().add(new Paragraph("Mascota")));
        infoTable.addCell(new Cell().add(new Paragraph(dto.getPetName())));

        infoTable.addCell(new Cell().add(new Paragraph("Doctor")));
        infoTable.addCell(new Cell().add(new Paragraph(dto.getDoctorName())));

        infoTable.addCell(new Cell().add(new Paragraph("Razón")));
        infoTable.addCell(new Cell().add(new Paragraph(dto.getAppointmentReason().toString())));

        infoTable.addCell(new Cell().add(new Paragraph("Diagnóstico")));
        infoTable.addCell(new Cell().add(new Paragraph(dto.getDiagnose())));

        infoTable.addCell(new Cell().add(new Paragraph("Tratamiento")));
        infoTable.addCell(new Cell().add(new Paragraph(dto.getTreatment())));

        infoTable.addCell(new Cell().add(new Paragraph("Fecha")));
        infoTable.addCell(new Cell().add(new Paragraph(dto.getDate().toString())));

        document.add(infoTable);
        document.add(new Paragraph("\n"));

        document.close();


        return out.toByteArray();
    }
}
