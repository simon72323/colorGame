import { Settings } from "cc";

export interface ProjectSettings extends Settings {
    project: {
        // 版號
        version: string,
        environment: string
    }
}

export enum ProjectCategory {
    project = "project"
}
export enum ProjectProperty {
    version = "version",
    environment = "environment"
}
