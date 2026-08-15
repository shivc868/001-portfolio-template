export type Photo = {
  id: string;
  title: string;
  location: string;
  year: number;
  /** CSS aspect-ratio value, e.g. "4 / 5". */
  aspect: string;
  src: string;
};

export const photos: Photo[] = [
  { id: "p01", title: "Loop, Blue Hour", location: "Chicago", year: 2026, aspect: "4 / 5", src: "/media/photo-01.jpg" },
  { id: "p02", title: "Sixth Avenue", location: "New York", year: 2026, aspect: "3 / 4", src: "/media/photo-02.jpg" },
  { id: "p03", title: "Meteor Over the Ridge", location: "Engadin", year: 2025, aspect: "16 / 10", src: "/media/photo-03.jpg" },
  { id: "p04", title: "Gate, Fog Coming", location: "San Francisco", year: 2025, aspect: "1 / 1", src: "/media/photo-04.jpg" },
  { id: "p05", title: "Neon District", location: "Seoul", year: 2025, aspect: "4 / 5", src: "/media/photo-05.jpg" },
  { id: "p06", title: "Canyon, Rush Hour", location: "Chicago", year: 2025, aspect: "3 / 4", src: "/media/photo-06.jpg" },
  { id: "p07", title: "Still Lake", location: "Dolomites", year: 2024, aspect: "16 / 10", src: "/media/photo-07.jpg" },
  { id: "p08", title: "Cumulus", location: "Over Brandenburg", year: 2024, aspect: "3 / 4", src: "/media/photo-08.jpg" },
  { id: "p09", title: "Quadriga, Midday", location: "Berlin", year: 2024, aspect: "1 / 1", src: "/media/photo-09.jpg" },
  { id: "p10", title: "Surf Line, From Above", location: "Atlantic coast", year: 2023, aspect: "16 / 10", src: "/media/photo-10.jpg" },
  { id: "p11", title: "Encore", location: "Columbiahalle, Berlin", year: 2023, aspect: "4 / 5", src: "/media/photo-11.jpg" },
  { id: "p12", title: "Freight, Passing Slow", location: "Brandenburg", year: 2023, aspect: "3 / 4", src: "/media/photo-12.jpg" },
];
