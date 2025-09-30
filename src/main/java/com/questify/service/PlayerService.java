package com.questify.service;

import com.questify.Player;
import com.questify.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder; // Import PasswordEncoder
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final PasswordEncoder passwordEncoder; // 1. Add the PasswordEncoder field

    @Autowired
    public PlayerService(PlayerRepository playerRepository, PasswordEncoder passwordEncoder) { // 2. Inject it in the constructor
        this.playerRepository = playerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Player createPlayer(Player player) {
        // 1. Check if a player with this username already exists
        if (playerRepository.findByUsername(player.getUsername()).isPresent()) {
            // 2. If it exists, throw a "Conflict" error
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken.");
        }

        // 3. If username is unique, proceed with hashing the password and saving
        player.setPassword(passwordEncoder.encode(player.getPassword()));
        return playerRepository.save(player);
    }

    public Player login(String username, String password) {
        // 4. Find the player or throw a 404 error
        Player player = playerRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 5. Securely check the password or throw a 401 error
        if (!passwordEncoder.matches(password, player.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password");
        }

        return player;
    }

    // This method remains the same
    public void addXpAndGold(Player player, int xpToAdd, int goldToAdd) {
        player.setXp(player.getXp() + xpToAdd);
        player.setGold(player.getGold() + goldToAdd);

        int xpNeeded = calculateXpForNextLevel(player.getLevel());
        while (player.getXp() >= xpNeeded) {
            player.setLevel(player.getLevel() + 1);
            player.setXp(player.getXp() - xpNeeded);
            xpNeeded = calculateXpForNextLevel(player.getLevel());
        }
        playerRepository.save(player);
    }

    // This method remains the same
    private int calculateXpForNextLevel(int currentLevel) {
        return currentLevel * 100;
    }
}