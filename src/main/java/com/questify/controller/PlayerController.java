package com.questify.controller;

import com.questify.Player;
import com.questify.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*") // 1. ADD THIS LINE
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPlayer(@RequestBody Player newPlayer) {
        try {
            Player createdPlayer = playerService.createPlayer(newPlayer);
            // If successful, return the player with a 200 OK status
            return ResponseEntity.ok(createdPlayer);
        } catch (ResponseStatusException e) {
            // If there's an error (like username taken), create a custom error message
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getReason()); // e.g., "Username is already taken."
            // Return the error message with the specific status code (e.g., 409 Conflict)
            return new ResponseEntity<>(error, e.getStatusCode());
        }
    }

    @PostMapping("/login")
    public Player loginPlayer(@RequestBody Player loginRequest) {
        return playerService.login(loginRequest.getUsername(), loginRequest.getPassword());
    }
}