package dev.ikana.miolink.browse

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import dev.ikana.miolink.appContainer
import dev.ikana.miolink.tree.TreeSource
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn

data class SearchUiState(
    /** The query the [results] are for. */
    val query: String = "",
    val results: SearchResults = SearchResults(),
)

/**
 * Searches the cached tree below directory [scopeId] (everything, from the
 * root) as the query changes; see [searchTree]. Opening or editing a result
 * goes through [BrowseViewModel], like the directory's own links.
 */
class SearchViewModel(private val scopeId: Long, tree: TreeSource) : ViewModel() {
    private val query = MutableStateFlow("")

    val state: StateFlow<SearchUiState> = combine(
        query,
        tree.allDirectories(),
        tree.allLinks(),
    ) { query, directories, links ->
        SearchUiState(query, searchTree(query, scopeId, directories, links))
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), SearchUiState())

    fun onQueryChange(value: String) {
        query.value = value
    }

    companion object {
        fun factory(scopeId: Long): ViewModelProvider.Factory = viewModelFactory {
            initializer { SearchViewModel(scopeId, appContainer.treeRepository) }
        }
    }
}
