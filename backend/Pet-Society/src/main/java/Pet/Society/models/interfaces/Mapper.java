package Pet.Society.models.interfaces;

//WORKS AS A METHOD FOR MAPPER AN ENTITY TO A DTO / DTO TO AN ENTITY
public interface Mapper<D, E> {
    E toEntity(D dto);
    D toDTO(E entity);
}
