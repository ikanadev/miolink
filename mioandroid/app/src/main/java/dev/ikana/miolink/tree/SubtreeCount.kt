package dev.ikana.miolink.tree

/**
 * What a recursive delete of a directory removes besides the directory
 * itself: its [subdirectories] at any depth and the [links] in all of them.
 */
data class SubtreeCount(val subdirectories: Int, val links: Int)
