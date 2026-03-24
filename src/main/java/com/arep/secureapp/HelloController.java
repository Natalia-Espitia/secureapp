package com.arep.secureapp;

import org.springframework.web.bind.annotation.GetMapping; 
import org.springframework.web.bind.annotation.RestController; 

@RestController 
public class HelloController {

    @GetMapping("/api/health") 
    public String index() { 
    return "secureapp-backend-ok"; 
    } 
} 