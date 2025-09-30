package com.questify;

import com.questify.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final TaskRepository taskRepository;

    @Autowired
    public DataInitializer(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (taskRepository.count() == 0) {
            System.out.println("Creating 20 built-in tasks...");

            // --- PRODUCTIVITY TASKS ---
            taskRepository.save(new Task("Tidy Your Workspace", "Spend 15 minutes organizing your desk.", 20, 5));
            taskRepository.save(new Task("Plan Your Day", "Write down your top 3 priorities for today.", 15, 5));
            taskRepository.save(new Task("Inbox Zero", "Clear your email inbox.", 30, 10));
            taskRepository.save(new Task("Weekly Review", "Review your goals for the upcoming week.", 25, 10));
            taskRepository.save(new Task("Laundry Load", "Complete one full load of laundry.", 40, 15));
            taskRepository.save(new Task("Cook a Meal", "Cook a healthy meal instead of ordering out.", 50, 20));
            taskRepository.save(new Task("Pay a Bill", "Pay one of your upcoming bills.", 10, 5));

            // --- WELLNESS & FUN TASKS ---
            taskRepository.save(new Task("Go for a 30-minute walk", "A short walk to clear your head.", 30, 10));
            taskRepository.save(new Task("Hydration Goal", "Drink 8 glasses of water today.", 20, 10));
            taskRepository.save(new Task("Guided Meditation", "Try a 10-minute guided meditation.", 15, 5));
            taskRepository.save(new Task("20-Minute Workout", "Do a short workout, yoga, or stretching session.", 40, 15));
            taskRepository.save(new Task("Connect with a Friend", "Call or message a friend or family member.", 30, 15));
            taskRepository.save(new Task("Play a Game", "Spend 30 minutes playing a game.", 10, 0));
            taskRepository.save(new Task("Listen to a Podcast", "Listen to an episode of an interesting podcast.", 15, 5));

            // --- CREATIVE & LEARNING TASKS ---
            taskRepository.save(new Task("Read for 20 minutes", "Read a book or an interesting article.", 25, 5));
            taskRepository.save(new Task("Creative Doodle", "Spend 10 minutes doodling whatever comes to mind.", 15, 10));
            taskRepository.save(new Task("Learn Something New", "Watch a short documentary or educational video.", 35, 10));
            taskRepository.save(new Task("Journal Entry", "Write a short journal entry about your day.", 20, 5));
            taskRepository.save(new Task("Practice a Skill", "Spend 15 minutes practicing an instrument or a language.", 30, 10));

            // --- TIMED 'FOCUS MODE' TASKS ---
            taskRepository.save(new Task("Focused Study Session", "Study a subject with no distractions.", 60, 25, 45));


            System.out.println("20 Built-in tasks created successfully.");
        }
    }
}