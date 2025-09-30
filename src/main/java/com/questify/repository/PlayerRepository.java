package com.questify.repository;

import com.questify.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    Optional<Player> findByUsername(String username);
    // By extending JpaRepository, we get a lot of database methods for free!
    // For example: save(), findById(), findAll(), deleteById().
}