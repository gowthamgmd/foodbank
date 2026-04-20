import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Keep this for debugging production crashes (e.g., white screen after login)
        // eslint-disable-next-line no-console
        console.error('UI crash caught by ErrorBoundary:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-lg w-full bg-white border border-red-200 rounded-xl p-6 shadow-sm">
                        <h1 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h1>
                        <p className="text-sm text-gray-600 mb-4">
                            The page crashed after navigation. Please reload and try again.
                        </p>
                        <p className="text-xs text-gray-500 break-words mb-4">
                            {this.state.error?.message || 'Unexpected UI error'}
                        </p>
                        <button
                            type="button"
                            onClick={this.handleReload}
                            className="btn-primary"
                        >
                            Reload page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
