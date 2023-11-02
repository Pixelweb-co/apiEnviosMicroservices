package com.calificaciones.calificarApi.CalificarRepository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.calificaciones.calificarApi.models.calificacion;

import java.util.List;

public interface CalificarRepository extends MongoRepository<calificacion,String> {
    List<calificacion> findByIdUsuario(String idUsuario);

}
