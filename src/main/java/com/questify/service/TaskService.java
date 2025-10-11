package com.questify.service;

import com.questify.Player;
import com.questify.Task;
import com.questify.repository.PlayerRepository;
import com.questify.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final PlayerRepository playerRepository;
    private final PlayerService playerService; // Injected PlayerService

    @Autowired
    public TaskService(TaskRepository taskRepository, PlayerRepository playerRepository, PlayerService playerService) {
        this.taskRepository = taskRepository;
        this.playerRepository = playerRepository;
        this.playerService = playerService;
    }

    public List<Task> getTasksByPlayerId(Long playerId) {
        return taskRepository.findByPlayerId(playerId);
    }

    public Task createTaskForPlayer(Long playerId, Task task) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"));
        task.setPlayer(player);
        return taskRepository.save(task);
    }

    public List<Task> getQuestBoardTasks() {
        List<Task> allQuests = taskRepository.findByPlayerIsNull();
        Collections.shuffle(allQuests);
        return allQuests.stream().limit(4).collect(Collectors.toList());
    }

    public Player completeTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        Player player = task.getPlayer();
        if (player != null) {
            // Give a fixed 20 XP and 10 Gold for each task.
            playerService.addXpAndGold(player, 20, 10);
        }

        taskRepository.delete(task); // Delete the task after completion
        return player; // Return the updated player
    }
}