export interface Resource {
    title: string;
    url: string;
    author?: string;
    type: 'Video' | 'Notes' | 'Other';
    subjectId: string;
}

export const resources: Resource[] = [
    {
        title: "Discrete Mathematics Playlist",
        url: "https://www.youtube.com/playlist?list=PLWkSUy9WubRZEAJHsX75g-Q7lyObRFBMs",
        author: "Akash Kumar",
        type: "Video",
        subjectId: "discrete-math"
    },
    {
        title: "The Helpers - Discrete Mathematics",
        url: "https://thehelpers.vercel.app/semesters/5/subjects/Discrete%20Mathematics",
        author: "The Helpers",
        type: "Notes",
        subjectId: "discrete-math"
    },
    {
        title: "Sujatha E Playlists",
        url: "https://www.youtube.com/@sujathae4270/playlists",
        author: "Sujatha E",
        type: "Video",
        subjectId: "discrete-math"
    },
    {
        title: "Computer Networks Resources (PYQ & PPT)",
        url: "https://drive.google.com/drive/folders/1zd6GUBcAGx9tARChea5ldx6BM-cQuVXX?usp=sharing",
        type: "Other",
        subjectId: "computer-networks"
    },
    {
        title: "FLA Playlist by Anita R",
        url: "https://www.youtube.com/playlist?list=PL6xbXi2C3sePDwyboAcu7l1UYuUT2SWYd",
        author: "Anita R",
        type: "Video",
        subjectId: "formal-languages"
    },
    {
        title: "FLA All Units",
        url: "https://www.youtube.com/playlist?list=PLAeJqLIux2WMSxzieR45QVTftR-FskFJR",
        author: "Deeba Kannan",
        type: "Video",
        subjectId: "formal-languages"
    },
    {
        title: "FLA PYQs (Google Drive)",
        url: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing",
        type: "Other",
        subjectId: "formal-languages"
    }
];

export const socialLinks = {
    github: "https://github.com/milind899",
    linkedin: "https://www.linkedin.com/in/milind899/",
    name: "Milind Shandilya"
};
