package com.questify.controller;

import com.questify.Task;
import com.questify.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // The URL now includes a placeholder for the player's ID
    @PostMapping("/player/{playerId}/create")
    public Task createTask(@PathVariable Long playerId, @RequestBody Task task) {
        return taskService.createTaskForPlayer(playerId, task);
    }

    @GetMapping("/all")
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }
    @PostMapping("/{taskId}/complete")
    public Task completeTask(@PathVariable Long taskId) {
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
