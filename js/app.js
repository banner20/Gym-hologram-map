document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing Virtual Gym Application");
    
    // Initialize the scene
    const scene = new Scene();
    
    // Initialize the UI with the scene
    const ui = new UI(scene);
    
    // Log initialization complete
    console.log("Virtual Gym Application initialized successfully");
}); 