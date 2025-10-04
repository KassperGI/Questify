package com.questify;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    // These attributes define the task's value upon completion
    private int xpValue;
    private int goldValue;
    private int durationInMinutes;
    private boolean isCompleted = false; // Tasks start as not completed.

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "player_id")
    @JsonIgnore
    private Player player;
    public Task() {
        // Default constructor needed by JPA
    }

    // Constructor for REGULAR tasks
    public Task(String title, String description, int xpValue, int goldValue) {
        this.title = title;
        this.description = description;
        this.xpValue = xpValue;
        this.goldValue = goldValue;
        this.isCompleted = false;
        this.durationInMinutes = 0; // Regular tasks have no duration
    }

    // Constructor for TIMED tasks
    public Task(String title, String description, int xpValue, int goldValue, int durationInMinutes) {
        this.title = title;
        this.description = description;
        this.xpValue = xpValue;
        this.goldValue = goldValue;
        this.isCompleted = false;
        this.durationInMinutes = durationInMinutes;
    }
}
