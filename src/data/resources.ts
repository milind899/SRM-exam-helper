export interface Resource {
    title: string;
    url: string;
    author?: string;
    type: 'Video' | 'Notes' | 'Other';
}

export const resources: Resource[] = [
    {
        title: "Discrete Mathematics Playlist",
        url: "https://www.youtube.com/playlist?list=PLWkSUy9WubRZEAJHsX75g-Q7lyObRFBMs",
        author: "YouTube",
        type: "Video"
    },
    {
        title: "The Helpers - Discrete Mathematics",
        url: "https://thehelpers.vercel.app/semesters/5/subjects/Discrete%20Mathematics",
        author: "The Helpers",
        type: "Notes"
    },
    {
        title: "Sujatha E Playlists",
        url: "https://www.youtube.com/@sujathae4270/playlists",
        author: "Sujatha E",
        type: "Video"
    }
];

export const socialLinks = {
    github: "https://github.com/milind899",
    linkedin: "https://www.linkedin.com/in/milind899/",
    name: "Milind Shandilya"
};
