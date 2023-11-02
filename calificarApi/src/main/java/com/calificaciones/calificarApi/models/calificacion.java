package com.calificaciones.calificarApi.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection="calificados")
public class calificacion {
    @Id
    private String id;
    private String idUsuario;
    private String idVotante;
    private int calificacion;

    
}
