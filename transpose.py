from pydub import AudioSegment
import librosa
import numpy as np
import os
from tqdm import tqdm

# List of all minor and major chords in a chromatic scale
minor_chords = ['Am', 'Bbm', 'Bm', 'Cm', 'Dbm', 'Dm', 'Ebm', 'Em', 'Fm', 'Gbm', 'Gm', 'Abm']
major_chords = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab']

# Function to get the index of the starting chord
def get_chord_index(chord_name, chord_type):
    chords = minor_chords if chord_type == 'minor' else major_chords
    try:
        return chords.index(chord_name)
    except ValueError:
        raise ValueError(f"Chord {chord_name} is not in the list of {chord_type} chords.")

# Function to generate the chord names based on the starting chord
def generate_chord_names(start_chord, chord_type):
    chords = minor_chords if chord_type == 'minor' else major_chords
    start_index = get_chord_index(start_chord, chord_type)
    
    # Generate transposed chord names for both up and down transpositions
    transposed_chords = [
        chords[(start_index + i) % 12] 
        for i in range(-6, 6)
    ]
    
    return transposed_chords

# Function to transpose the audio by a number of semitones
def transpose_audio(file_path, semitones):
    audio = AudioSegment.from_file(file_path)
    samples = np.array(audio.get_array_of_samples()).astype(np.float32)
    sample_rate = audio.frame_rate
    transposed_samples = librosa.effects.pitch_shift(samples, sr=sample_rate, n_steps=semitones)
    transposed_audio = AudioSegment(
        transposed_samples.astype(np.int16).tobytes(), 
        frame_rate=sample_rate,
        sample_width=audio.sample_width, 
        channels=audio.channels
    )
    return transposed_audio

# Function to save the transposed audio with a new name
def save_transposed_audio(original_file, new_chord_name, transposed_audio):
    base_name = os.path.splitext(os.path.basename(original_file))[0].split('_')[0]
    new_name = f"{base_name}_{new_chord_name}.mp3"
    transposed_audio.export(new_name, format="mp3")
    return new_name

# Main function to generate all transposed versions
def generate_transpositions(file_path, chord_name=None):
    # Extract the original chord from the filename if not provided
    if chord_name is None:
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        parts = base_name.split('_')
        if len(parts) < 2:
            raise ValueError("Filename must be in the format 'BaseName_ChordName.mp3' or specify the chord name directly.")
        chord_name = parts[1]

    # Determine if the chord is major or minor
    chord_type = 'minor' if chord_name.endswith('m') else 'major'
    
    # Generate transposed chord names
    transposed_chords = generate_chord_names(chord_name, chord_type)
    
    # Use tqdm to show progress
    for i, new_chord_name in enumerate(tqdm(transposed_chords, desc="Transposing")):
        # Adjusting semitone shift correctly
        semitone_shift = i - 6
        transposed_audio = transpose_audio(file_path, semitone_shift)
        save_transposed_audio(file_path, new_chord_name, transposed_audio)

if __name__ == "__main__":
    file_path = "A2_A.mp3"  # Replace with your file name
    generate_transpositions(file_path)
