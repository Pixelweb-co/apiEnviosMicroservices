package com.calificaciones.calificarApi.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.calificaciones.calificarApi.CalificarRepository.CalificarRepository;
import com.calificaciones.calificarApi.models.calificacion;

import java.util.List;

@RestController
@RequestMapping("calificaciones")
public class calificacionController {
    @Autowired
    private CalificarRepository repository;

    @GetMapping("/")
    public List<calificacion> index(){
        System.out.println("in index now");
        return repository.findAll();
    }
    @PostMapping("/")
    public String agregarCalificacion(@RequestBody calificacion calificacion) {

        System.out.println(calificacion);
        repository.save(calificacion);
        return "Calificación agregada correctamente";
    }

    @GetMapping("/bus")
    public List<calificacion> recuperarCalificaciones(@RequestParam("idUsuario") String idUsuario) {
        return repository.findByIdUsuario(idUsuario);
    }
}
