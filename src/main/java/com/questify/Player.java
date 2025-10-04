package com.questify;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

// @Data is from Lombok and automatically writes getter/setter methods for us. ✨
@Data
// @Entity tells Spring that this class is a blueprint for a database table.
@Entity
public class Player {

    // @Id marks this field as the unique primary key for the table.
    @Id
    // @GeneratedValue tells the database to automatically generate this ID for new players.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private int level = 1; // Players start at level 1.
    private int xp = 0;
    private int gold = 0;

    // Inside the Player class, after private int gold = 0;
    @JsonManagedReference
    @OneToMany(mappedBy = "player")
    @JsonIgnore
    private List<Task> tasks;
}