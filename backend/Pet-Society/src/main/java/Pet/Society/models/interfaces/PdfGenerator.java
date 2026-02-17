package Pet.Society.models.interfaces;

public interface PdfGenerator<T> {
    byte[] generate(T data);
}
