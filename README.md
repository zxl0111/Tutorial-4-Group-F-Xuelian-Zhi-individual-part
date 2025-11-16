# Tutorial-4-Group-F-Xuelian-Zhi-individual-part
This project takes Pacita Abad's “Wheels of Fortune” as its visual foundation, transforming the original static color blocks, concentric circles, and orbital grids into a continuously evolving dynamic system. In the group's final version, we primarily focused on the geometric structure, color language, and graphic composition of the visuals. In my personal extension, however, I was more concerned with whether these elements could breathe, flow, gradually emerge, or establish rhythmic connections with one another.

The animation runs automatically upon page load. The sole interaction is pressing the spacebar to regenerate the layout, maintaining the group version's functionality. Beyond this, the entire piece operates autonomously, independent of user input. This allows the work to function more like a visual organism with its own rhythm and life logic.


Animation Logic Explanation

The core structure of this animation revolves around four types of motion: breathing, rotation, manifestation, and floating. These actions combine to imbue the originally static geometric composition with rhythm and vitality.

First, each circular wheel undergoes a slow, breathing-like scaling using Perlin Noise. To avoid uniform rhythm, I divided the wheels into three breathing groups, each with distinct noise speeds and amplitudes. This creates a natural, irregular pulsation across the entire composition.

Small inner dots move as “floating particles,” bouncing off the wheel boundaries to form continuous microscopic flow. Standard vector reflection formulas were applied here, making particle trajectories appear more physical and fluid.

Multiple ring elements in the scene follow a reveal sequence progressing from the center outward; dot patterns on outer tracks also emerge gradually along paths opposite the wheel's rotation direction. These reveal behaviors are driven by a 0→1 cyclic phase value, maintaining steady rhythmic variation throughout the composition.

All wheels rotate very slowly on their own axes. This is not the protagonist's action but rather a subtle background motion of the entire system. Rotation, breathing, appearance, and floating overlap across different timescales, forming a continuously changing dynamic ecosystem.

To maintain visual stability, I used `randomSeed()` to lock the internal random results for each circular wheel. This prevents colors from jumping between frames and preserves the overall coherence.


Relationship with the final version of the group

The final group project is a complete static visual recreation. I retained all original graphic elements without adding new visible structures. The difference lies in introducing a series of temporal actions—breathing, rotation, materialization, and particle drift—to imbue the originally static imagery with coherence, gentleness, and rhythm.


Differences in animation extensions compared to other members

Compared to other team members' animation approaches, my version differs significantly in motion properties, trigger mechanisms, and visual logic.

First, my animation employs a fully automated time-driven system (time-based reveal + Perlin noise breathing) that runs continuously upon page load, requiring no mouse or keyboard input. Circles expand and contract with a Perlin noise-generated “breathing” effect while rotating slowly in a fixed direction. Scattered dots within float at random speeds and bounce off boundaries. Outer orbital points, along with the inner circle's 6 rings and 16 dots, reveal sequentially based on unified timing parameters, creating a cyclical visual rhythm.

In contrast, another team member's time-based version employs a completely different concept. His work emphasizes the dynamic behavior of “gravity-driven descent + disappearance,” rather than my persistent, non-disappearing organic breathing system.

Additionally, the team member working on user input implemented a version centered on “interactive manipulation.” Viewers can interact with the interface through various mouse operations. His work prioritizes “real-time interface manipulation” over automatically generated animations.

Compared to these two approaches, my version focuses on a rhythm independent of user input, Perlin noise-driven natural motion, and a time-based progressive reveal logic. It represents a wholly distinct animation form while maintaining faithful representation of the original graphic structure.