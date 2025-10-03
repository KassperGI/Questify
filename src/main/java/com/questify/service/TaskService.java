package com.questify.service;

import com.questify.Player;
import com.questify.Task;
import com.questify.repository.PlayerRepository;
import com.questify.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final PlayerRepository playerRepository; // We add the PlayerRepository
    private final PlayerService playerService; // NEW: Add PlayerService

    @Autowired
    public TaskService(TaskRepository taskRepository, PlayerRepository playerRepository, PlayerService playerService) {// NEW: Add PlayerService here
        this.taskRepository = taskRepository;
        this.playerRepository = playerRepository; // We add it to the constructor
        this.playerService = playerService; // NEW: And here
    }

    // ... existing methods ...

    // We replace the old createTask method with this one
    public Task createTaskForPlayer(Long playerId, Task task) {
        // Find the player by their ID
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found with id: " + playerId));

        // Link the new task to the player we found
        task.setPlayer(player);

        // Save the task, now with its owner
        return taskRepository.save(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }
    public Task completeTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        // Prevent completing a task twice
        if (task.isCompleted()) {
            throw new IllegalStateException("Task is already completed.");
        }

        // Mark task as complete
        task.setCompleted(true);

        // Award XP and Gold to the player
        Player player = task.getPlayer();
        if (player != null) {
            playerService.addXpAndGold(player, task.getXpValue(), task.getGoldValue());
        }

        return taskRepository.save(task);
    }
    // Add this method inside your TaskService class
    public List<Task> getTasksByPlayerId(Long playerId) {
        return taskRepository.findByPlayerId(playerId);
    }
}