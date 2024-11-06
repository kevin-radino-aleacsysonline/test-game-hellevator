import { Project } from './project';
import { IProject } from './types/projectType';

type WindowExt = Window &
    typeof globalThis & {
        TestProject: ProjectExports;
    };

interface ProjectExports {
    launch: () => void;
}

export default ((): ProjectExports => {
    const game: IProject = new Project();
    const pageReturn: ProjectExports = {
        launch: game.launch.bind(game),
    };
    if (typeof window !== undefined) {
        (window as WindowExt)['TestProject'] = pageReturn;
    }
    return pageReturn;
})();
