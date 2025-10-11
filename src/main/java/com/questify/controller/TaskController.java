package com.questify.controller;

import com.questify.Player;
import com.questify.Task;
import com.questify.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "*") // Added for frontend communication
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    // No @Autowired needed on a single constructor
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/player/{playerId}/create")
    public Task createTask(@PathVariable Long playerId, @RequestBody Task task) {
        return taskService.createTaskForPlayer(playerId, task);
    }

    // This is the single, correct method for completing a task
    @PostMapping("/{taskId}/complete")
    public Player completeTask(@PathVariable Long taskId) {
        return taskService.completeTask(taskId);
    }

    @GetMapping("/player/{playerId}")
    public List<Task> getTasksByPlayer(@PathVariable Long playerId) {
        return taskService.getTasksByPlayerId(playerId);
    }

    @GetMapping("/quest-board")
    public List<Task> getQuestBoardTasks() {
        return taskService.getQuestBoardTasks();
    }
}